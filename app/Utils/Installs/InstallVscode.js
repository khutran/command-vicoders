import Install from './Install';
import fs from 'fs';
import { Exception } from '@nsilly/exceptions';
import inquirer from 'inquirer';
import colors from 'colors';
import Darwin from '../Os/Darwin';
import Linux from '../Os/Linux';
import chownr from 'chownr';
import * as _ from 'lodash';
const { spawn } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const rimraf = util.promisify(require('rimraf'));

export default class InstallVscode extends Install {
  async service() {
    if (this.os === 'darwin') {
      return new Promise(async (resolve, reject) => {
        try {
          const darwin = new Darwin();

          if (!darwin.CheckExists('brew')) {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'brew', message: 'Brew not install  - Do you want insatll brew?', default: true });
            if (answers.brew) {
              if (!fs.existsSync('/usr/bin/curl')) {
                await exec('apt install -y curl');
              }
              const curl = await exec('curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install');
              const brew = spawn('ruby', ['-e', curl.stdout]);
              brew.stdout.on('data', data => {
                console.log(data.toString());
              });
              brew.on('close', code => {
                if (code === 0) {
                  console.log(colors.green('insatll brew success !'));
                }
              });
            }
          }

          if (darwin.CheckExists('code')) {
            resolve({ code: 1, message: 'service vscode exitis install' });
          } else {
            const vscode = spawn('brew', ['cask', 'install', 'visual-studio-code']);
            vscode.stdout.on('data', data => {
              console.log(data.toString());
            });

            vscode.on('close', code => {
              if (code !== 0) {
                reject(code);
              } else {
                resolve({ message: 'install success !', code: code });
              }
            });
          }
        } catch (e) {
          reject(e);
        }
      });
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        return new Promise(async (resolve, reject) => {
          try {
            if (fs.existsSync('/usr/bin/code')) {
              resolve({ code: 1, message: 'service vscode exitis install' });
            } else {
              if (!fs.existsSync('/usr/bin/curl')) {
                await exec('apt install -y curl');
              }
              const data = 'deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main';
              const microsoft = spawn('curl', ['https://packages.microsoft.com/keys/microsoft.asc']);
              const gpg = spawn('gpg', ['--dearmor', '--output', '/etc/apt/trusted.gpg.d/microsoft.gpg']);

              microsoft.stdout.on('data', data => {
                gpg.stdin.write(data);
              });

              microsoft.on('close', code => {
                if (code !== 0) {
                  console.log(`ps process exited with code ${code}`);
                }
                gpg.stdin.end();
              });

              gpg.on('close', async code => {
                if (code === 0) {
                  console.log(colors.green('down microsoft success ... done !'));
                  fs.writeFile('/etc/apt/sources.list.d/vscode.list', data, err => {
                    if (err) {
                      throw new Exception('create file repo errro');
                    }
                    console.log(colors.green('create file repo ... success !'));
                  });

                  await exec('apt-get -y update');

                  const vscode = spawn('apt-get', ['-y', 'install', 'code']);
                  let cur = 0;
                  vscode.stdout.on('data', chunk => {
                    cur += chunk.length;
                    const percent = cur.toFixed(2);
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Install ... ${percent}`);
                  });

                  vscode.on('close', code => {
                    if (code !== 0) {
                      reject(code);
                    } else {
                      resolve({ message: 'install success !', code: code });
                    }
                  });
                }
              });
            }
          } catch (e) {
            reject(e);
          }
        });
      }
      if (osName === 'redhat') {
        return new Promise(async (resolve, reject) => {
          try {
            if (fs.existsSync('/usr/bin/code')) {
              throw new Exception('Vscode exitis', 1);
            }

            await exec('rpm --import https://packages.microsoft.com/keys/microsoft.asc');
            const data =
              '[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc';
            fs.writeFile('/etc/yum.repos.d/vscode.repo', data, err => {
              if (err) {
                throw new Exception(colors.red('create file repo error'), 1);
              }
              console.log(colors.green('create file repo ... success !'));
            });

            await exec('yum -y update');

            const vscode = spawn('yum', ['-y', 'install', 'code']);
            let cur = 0;
            vscode.stdout.on('data', chunk => {
              cur += chunk.length;
              const percent = cur.toFixed(2);
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write(`Install ... ${percent}`);
            });

            vscode.on('close', code => {
              if (code !== 0) {
                reject(code);
              } else {
                resolve({ message: 'install success !', code: code });
              }
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    }
  }

  async extentions() {
    if (this.os === 'darwin') {
      const darwin = new Darwin();
      const user = darwin.userInfo();
      console.log('Clear extentions ....');
      if (!darwin.CheckExists('code')) {
        throw new Exception('VIsual studio not install', 2);
      }
      if (!fs.existsSync(`${user.homedir}/.vscode`)) {
        fs.mkdirSync(`${user.homedir}/.vscode`);
      }
      await rimraf(`${user.homedir}/.vscode/extensions`);
      console.log(`Clear extentions .... ${colors.green('done')}`);
      const extension = spawn('git', ['clone', 'https://github.com/codersvn/vscode_extensions.git', `${user.homedir}/.vscode/extensions`]);
      extension.stderr.on('data', data => {
        if (data.indexOf('done') > -1) {
          data = _.replace(data, ', done.', '');
        }
        console.log(`${data}`);
      });
      extension.on('close', code => {
        chownr(`${user.homedir}/.vscode/extensions`, user.uid, user.gid, err => {
          if (err) {
            throw new Exception(err.messages);
          }
        });
        console.log(`Install ... ${code} ${colors.green('done')}`);
      });
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      const user = linux.userInfo();
      if (osName === 'debian') {
        console.log('Clear extentions ....');
        if (!linux.CheckExists('code')) {
          throw new Exception('VIsual studio not install', 2);
        }
        if (!fs.existsSync(`${user.homedir}/.vscode`)) {
          fs.mkdirSync(`${user.homedir}/.vscode`);
        }
        await rimraf(`${user.homedir}/.vscode/extensions`);
        console.log(`Clear extentions .... ${colors.green('done')}`);
        const extension = spawn('git', ['clone', 'https://github.com/codersvn/vscode_extensions.git', `${user.homedir}/.vscode/extensions`]);
        extension.stderr.on('data', data => {
          if (data.indexOf('done') > -1) {
            data = _.replace(data, ', done.', '');
          }
          console.log(`${data}`);
        });
        extension.on('close', code => {
          chownr(`${user.homedir}/.vscode/extensions`, user.uid, user.gid, err => {
            if (err) {
              throw new Exception(err.messages);
            }
          });
          console.log(`Install ... ${code} ${colors.green('done')}`);
        });
      }
      if (osName === 'redhat') {
        console.log('Clear extentions ....');
        if (!linux.CheckExists('code')) {
          throw new Exception('VIsual studio not install', 2);
        }
        if (!fs.existsSync(`${user.homedir}/.vscode`)) {
          fs.mkdirSync(`${user.homedir}/.vscode`);
        }
        await rimraf(`${user.homedir}/.vscode/extensions`);
        console.log(`Clear extentions .... ${colors.green('done')}`);
        const extension = spawn('git', ['clone', 'https://github.com/codersvn/vscode_extensions.git', `${user.homedir}/.vscode/extensions`]);
        extension.stderr.on('data', data => {
          if (data.indexOf('done') > -1) {
            data = _.replace(data, ', done.', '');
          }
          console.log(`${data}`);
        });
        extension.on('close', code => {
          chownr(`${user.homedir}/.vscode/extensions`, user.uid, user.gid, err => {
            if (err) {
              throw new Exception(err.messages);
            }
          });
          console.log(`Install ... ${code} ${colors.green('done')}`);
        });
      }
    }
  }
}

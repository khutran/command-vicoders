import Install from './Install';
import fs from 'fs';
import { Exception } from '@nsilly/exceptions';
import inquirer from 'inquirer';
import colors from 'colors';
import Darwin from '../Os/Darwin';
import Linux from '../Os/Linux';
import * as _ from 'lodash';
import { spawn, exec } from 'child-process-promise';
import Win from '../Os/Win';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const chownr = util.promisify(require('chownr'));

export default class InstallVscode extends Install {
  async service() {
    if (this.os === 'win32') {
      return new Promise(async (resolve, reject) => {
        try {
          const win = new Win();
          if (await win.CheckExists('code')) {
            resolve({ code: 1, message: 'service vscode exitis install' });
          } else {
            console.log(colors.green('Install Vscode ... !'));
            await exec(`git clone https://github.com/khutran/vscode-win.git ${win.tmpDir()}/vscode-win`);
            await exec(`${win.tmpDir()}/vscode-win/VSCodeUserSetup-x64-1.27.2.exe`);
            console.log(colors.green('Install Success ... !'));
            await rimraf(`${win.tmpDir()}/vscode-win`);
            console.log(colors.green('Install Success ... !'));
            resolve({ message: 'install success !', code: 0 });
          }
        } catch (e) {
          reject(e);
        }
      });
    }
    if (this.os === 'darwin') {
      return new Promise(async (resolve, reject) => {
        try {
          const darwin = new Darwin();

          if (!(await darwin.CheckExists('brew'))) {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'brew', message: 'Brew not install  - Do you want insatll brew?', default: true });
            if (answers.brew) {
              if (!fs.existsSync('/usr/bin/curl')) {
                await exec('apt-get install -y curl');
              }
              const curl = await exec('curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install');
              await spawn('ruby', ['-e', curl.stdout]);
              console.log(colors.green('insatll brew success !'));
            }
          }

          if (await darwin.CheckExists('code')) {
            resolve({ code: 1, message: 'service vscode exitis install' });
          } else {
            await spawn('brew', ['cask', 'install', 'visual-studio-code']);
            resolve({ message: 'install success !', code: 0 });
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
                await exec('apt-get install -y curl');
              }
              const data = 'deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main';
              const microsoft = await spawn('curl', ['https://packages.microsoft.com/keys/microsoft.asc'], { capture: ['stdout', 'stderr'] });
              await spawn('gpg', ['--dearmor', '--output', '/etc/apt/trusted.gpg.d/microsoft.gpg']).progress(childProcess => {
                childProcess.stdin.write(microsoft.stdout);
                childProcess.stdin.end();
              });
              console.log(colors.green('down microsoft success ... done !'));
              fs.writeFileSync('/etc/apt/sources.list.d/vscode.list', data);
              console.log(colors.green('create file repo ... success !'));
              await exec('apt-get -y update');
              const vscode = spawn('apt-get', ['-y', 'install', 'code']);
              let cur = 0;
              vscode.childProcess.stdout.on('data', chunk => {
                cur += chunk.length;
                const percent = cur.toFixed(2);
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(`Install ... ${percent}`);
              });

              vscode.childProcess.on('close', code => {
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
      if (osName === 'redhat') {
        return new Promise(async (resolve, reject) => {
          try {
            if (fs.existsSync('/usr/bin/code')) {
              throw new Exception('Vscode exitis', 1);
            }

            await exec('rpm --import https://packages.microsoft.com/keys/microsoft.asc');
            const data =
              '[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc';
            fs.writeFileSync('/etc/yum.repos.d/vscode.repo', data);
            console.log(colors.green('create file repo ... success !'));

            await exec('yum -y update');

            const vscode = spawn('yum', ['-y', 'install', 'code']);
            let cur = 0;
            vscode.childProcess.stdout.on('data', chunk => {
              cur += chunk.length;
              const percent = cur.toFixed(2);
              process.stdout.clearLine();
              process.stdout.cursorTo(0);
              process.stdout.write(`Install ... ${percent}`);
            });

            vscode.childProcess.on('close', code => {
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
      if (!(await darwin.CheckExists('code'))) {
        throw new Exception('VIsual studio not install', 2);
      }
      if (!fs.existsSync(`${user.homedir}/.vscode`)) {
        fs.mkdirSync(`${user.homedir}/.vscode`);
      }
      await rimraf(`${user.homedir}/.vscode/extensions`);
      console.log(`Clear extentions .... ${colors.green('done')}`);
      const extension = spawn('git', ['clone', 'https://github.com/codersvn/vscode_extensions.git', `${user.homedir}/.vscode/extensions`]);
      extension.childProcess.stderr.on('data', data => {
        if (data.indexOf('done') > -1) {
          data = _.replace(data, ', done.', '');
        }
        console.log(`${data}`);
      });
      extension.childProcess.on('close', code => {
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
        if (!(await linux.CheckExists('code'))) {
          throw new Exception('VIsual studio not install', 2);
        }
        if (!fs.existsSync(`${user.homedir}/.vscode`)) {
          fs.mkdirSync(`${user.homedir}/.vscode`);
        }
        await rimraf(`${user.homedir}/.vscode/extensions`);
        console.log(`Clear extentions .... ${colors.green('done')}`);
        const extension = spawn('git', ['clone', 'https://github.com/codersvn/vscode_extensions.git', `${user.homedir}/.vscode/extensions`]);
        extension.childProcess.stderr.on('data', data => {
          if (data.indexOf('done') > -1) {
            data = _.replace(data, ', done.', '');
          }
          console.log(`${data}`);
        });
        extension.childProcess.on('close', async code => {
          await chownr(`${user.homedir}/.vscode/extensions`, user.uid, user.gid);
          console.log(`Install ... ${code} ${colors.green('done')}`);
        });
      }
      if (osName === 'redhat') {
        console.log('Clear extentions ....');
        if (!(await linux.CheckExists('code'))) {
          throw new Exception('VIsual studio not install', 2);
        }
        if (!fs.existsSync(`${user.homedir}/.vscode`)) {
          fs.mkdirSync(`${user.homedir}/.vscode`);
        }
        await rimraf(`${user.homedir}/.vscode/extensions`);
        console.log(`Clear extentions .... ${colors.green('done')}`);
        const extension = spawn('git', ['clone', 'https://github.com/codersvn/vscode_extensions.git', `${user.homedir}/.vscode/extensions`]);
        extension.childProcess.stderr.on('data', data => {
          if (data.indexOf('done') > -1) {
            data = _.replace(data, ', done.', '');
          }
          console.log(`${data}`);
        });
        extension.childProcess.on('close', async code => {
          await chownr(`${user.homedir}/.vscode/extensions`, user.uid, user.gid);
          console.log(`Install ... ${code} ${colors.green('done')}`);
        });
      }
    }
  }
}

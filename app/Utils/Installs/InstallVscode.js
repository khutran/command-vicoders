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
const mv = util.promisify(require('mv'));

export default class InstallVscode extends Install {
  async service() {
    try {
      if (this.os === 'darwin') {
        const darwin = new Darwin();
        if (!darwin.CheckExists('brew')) {
          const answers = await inquirer.prompt({ type: 'confirm', name: 'brew', message: 'Brew not install  - Do you want insatll brew?', default: true });
          if (answers.brew) {
            const curl = await exec('curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install');
            const brew = spawn('ruby', ['-e', curl.stdout]);
            brew.stdout.on('data', data => {
              console.log(data.toString());
            });
            brew.on('close', async code => {
              if (code === 0) {
                console.log(colors.green('insatll brew success !'));
              }
            });
          }
        }

        if (darwin.CheckExists('code')) {
          throw new Exception('You install extist vscode !', 1);
        }

        const vscode = spawn('brew', ['cask', 'install', 'visual-studio-code']);
        vscode.stdout.on('data', data => {
          console.log(data.toString());
        });

        vscode.on('close', code => {
          if (code !== 0) {
            throw new Exception('install vscode fail !', 1);
          }
        });
      }
      if (this.os === 'linux') {
        const linux = new Linux();
        const osName = linux.osName();
        if (osName === 'debian') {
          const data = 'deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main';
          const microsoft = spawn('curl', ['https://packages.microsoft.com/keys/microsoft.asc']);
          const gpg = spawn('gpg', ['--dearmor', '--output', '/etc/apt/trusted.gpg.d/microsoft.gpg']);

          microsoft.stdout.on('data', data => {
            gpg.stdin.write(data);
          });

          microsoft.on('close', code => {
            if (code === 0) {
              gpg.stdin.end();
            }
          });

          gpg.on('close', code => {
            if (code === 0) {
              console.log(colors.green('down microsoft success ... done !'));
              fs.appendFile('/etc/apt/sources.list.d/vscode.list', data, err => {
                if (err) {
                  throw new Exception('create file repo errro');
                }
                console.log(colors.green('create file repo ... success !'));
              });
            }
          });

          await await exec('apt-get -y update');
          const code = spawn('apt-get', ['-y', 'install', 'code']);

          let cur = 0;
          code.stdout.on('data', chunk => {
            console.log(this);
            cur += chunk.length;
            const percent = (100.0 * cur).toFixed(2);
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Install ... ${percent}`);
          });

          code.stderr.on('data', chunk => {
            cur += chunk.length;
            const percent = (100.0 * cur).toFixed(2);
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Install ... ${percent}`);
          });
          code.on('close', code => {
            if (code === 0) {
              console.log(colors.green('Install vs code success ... !'));
            }
          });
        }
        if (osName === 'redhat') {
          await exec('rpm --import https://packages.microsoft.com/keys/microsoft.asc');
          const data =
            '[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc';
          fs.appendFile('/etc/yum.repos.d/vscode.repo', data, err => {
            if (err) {
              throw new Exception(colors.red('create file repo error'), 1);
            }
            console.log(colors.green('create file repo ... success !'));
          });

          await exec('yum -y update');
          const code = spawn('yum', ['-y', 'install', 'code']);
          code.stdout.on('data', data => {
            console.log(data.toString());
          });
          code.stderr.on('data', data => {
            console.log(data.toString());
          });
          code.on('close', code => {
            if (code === 0) {
              console.log(colors.green('Install vs code success ... !'));
            }
          });
        }
      }
    } catch (e) {
      throw new Exception(e.message, 1);
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

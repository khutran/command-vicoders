import Install from './Install';
import fs from 'fs';
import { Exception } from '@codersvn/exceptions';
import inquirer from 'inquirer';
import colors from 'colors';
import Darwin from '../Os/Darwin';
import Linux from '../Os/Linux';
const { spawn } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class InstallVscode extends Install {
  async run() {
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
          throw new Exception('install extist vscode !', 1);
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
          const microsoft = spawn('curl', ['https://packages.microsoft.com/keys/microsoft.asc']);
          const gpg = spawn('gpg', ['--dearmor', '>', 'microsoft.gpg']);
          microsoft.stdout.on('data', data => {
            gpg.stdin.write(data);
          });

          gpg.on('close', code => {
            if (code === 0) {
              console.log(colors.green('down microsoft success ... done !'));
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
        }
      }
    } catch (e) {
      throw new Exception(e.message, 1);
    }
  }
}

import Install from './Install';
import { Darwin } from '../Os/darwin';
import { Exception } from '@codersvn/exceptions';
import inquirer from 'inquirer';
import colors from 'colors';
const { spawn } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class InstallVscode extends Install {
  async run() {
    try {
      if (this.os === 'darwin') {
        if (!new Darwin().package('brew')) {
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

        if (new Darwin().package('code')) {
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
    } catch (e) {
      console.log(e);
    }
  }
}

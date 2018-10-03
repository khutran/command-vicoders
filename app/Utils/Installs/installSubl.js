import Install from './Install';
import fs from 'fs';
import * as _ from 'lodash';
import { Exception } from '@nsilly/exceptions';
import inquirer from 'inquirer';
import colors from 'colors';
import Darwin from '../Os/Darwin';
import Linux from '../Os/Linux';
import { spawn, exec } from 'child-process-promise';
import Win from '../Os/Win';
import path from 'path';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const chownr = util.promisify(require('chownr'));

export default class InstallSubl extends Install {
  async service() {
    if (this.os === 'win32') {
      return new Promise(async (resolve, reject) => {
        try {
          const win = new Win();
          if (fs.existsSync(path.join('C:', 'Program Files', 'Sublime Text 3'))) {
            resolve({ code: 1, message: 'service Subl exitis install' });
          } else {
            console.log(colors.green('Install Subl ... !'));
            if (fs.existsSync(`${win.tmpDir()}/subl-win`)) {
              await rimraf(`${win.tmpDir()}/subl-win`);
            }
            await exec(`git clone https://github.com/khutran/subl-win.git ${win.tmpDir()}/subl-win`);
            await exec(`${win.tmpDir()}/subl-win/Sublime-Text-Build-3176-x64-Setup.exe`);
            console.log(colors.green('Install Success ... !'));
            await rimraf(`${win.tmpDir()}/subl-win`);
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
              const curl = await exec('curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install');
              await spawn('ruby', ['-e', curl.stdout]);
              console.log(colors.green('Install brew success ... !'));
            }
          }
          if (await darwin.CheckExists('subl')) {
            resolve({ message: 'subl exitis install !', code: 1 });
          } else {
            await spawn('brew', ['cask', 'install', 'sublime-text']);
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
            if (!fs.existsSync('/usr/bin/wget')) {
              console.log('install wget ... !');
              await exec('apt-get install -y wget');
            }
            if (await linux.CheckExists('subl')) {
              resolve({ message: 'subl exitis install !', code: 1 });
            } else {
              const data = 'deb https://download.sublimetext.com/ apt/stable/';
              const sublime = await spawn('wget', ['-qO', '-', 'https://download.sublimetext.com/sublimehq-pub.gpg'], { capture: ['stdout'] });
              await spawn('apt-key', ['add', '-'], { capture: ['stdout', 'stderr'] }).progress(childProcess => {
                childProcess.stdin.write(sublime.stdout);
                childProcess.stdin.end();
              });

              console.log(colors.green('down sublime-text success ... done !'));
              fs.writeFileSync('/etc/apt/sources.list.d/sublime-text.list', data);
              await exec('apt-get -y update');
              await spawn('apt-get', ['-y', 'install', 'sublime-text']);
              resolve({ message: 'install success !', code: 0 });
            }
          } catch (e) {
            reject(e);
          }
        });
      }
      if (osName === 'redhat') {
        return new Promise(async (resolve, reject) => {
          try {
            if (await linux.CheckExists('subl')) {
              resolve({ message: 'subl exitis install !', code: 1 });
            } else {
              await exec('rpm -v --import https://download.sublimetext.com/sublimehq-rpm-pub.gpg');
              const data =
                '[sublime-text]\nname=Sublime Text - x86_64 - Stable\nbaseurl=https://download.sublimetext.com/rpm/stable/x86_64\nenabled=1\ngpgcheck=1\ngpgkey=https://download.sublimetext.com/sublimehq-rpm-pub.gpg';

              fs.writeFileSync('/etc/yum.repos.d/sublime-text.repo', data);

              await exec('yum -y update');

              spawn('yum', ['-y', 'install', 'sublime-text'], { capture: ['stdout', 'stderr'] });
              resolve({ message: 'install success !', code: 0 });
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    }
  }

  async extentions() {
    if (this.os === 'win32') {
      const win = new Win();
      const user = win.userInfo();
      console.log('Clear extentions ....');
      if (!(await win.CheckExists('code'))) {
        throw new Exception('VIsual studio not install', 2);
      }
      if (!fs.existsSync(`${user.homedir}/.vscode`)) {
        fs.mkdirSync(`${user.homedir}/.vscode`);
      }
      await rimraf(`${user.homedir}\\${path.join('AppData', 'Roaming', 'Sublime Text 3', 'Packages')}`);
      console.log(`Clear extentions .... ${colors.green('done')}`);
      const extension = spawn('git', [
        'clone',
        '--recurse-submodules',
        '-j8',
        'https://github.com/codersvn/sublime_extensitions',
        `${user.homedir}\\${path.join('AppData', 'Roaming', 'Sublime Text 3', 'Packages')}`
      ]);
      extension.childProcess.stderr.on('data', data => {
        if (data.indexOf('done') > -1) {
          data = _.replace(data, ', done.', '');
        }
        console.log(`${data}`);
      });
      extension.childProcess.on('close', async code => {
        // await chownr(`${user.homedir}\\${path.join('AppData', 'Roaming', 'Sublime Text 3', 'Packages')}`, user.uid, user.gid);
        console.log(`Install ... ${code} ${colors.green('done')}`);
      });
    }

    if (this.os === 'darwin') {
      const darwin = new Darwin();
      const user = darwin.userInfo();
      console.log('Clear extentions ....');
      if (!(await darwin.CheckExists('subl'))) {
        throw new Exception('Sublime - text not install', 2);
      }
      if (!fs.existsSync(`${user.homedir}/.config/sublime-text-3/Packages`)) {
        fs.mkdirSync(`${user.homedir}/.config/sublime-text-3/Packages`);
      }
      await rimraf(`${user.homedir}/.config/sublime-text-3/Packages`);
      console.log(`Clear extentions .... ${colors.green('done')}`);
      const extension = spawn('git', [
        'clone',
        '--recurse-submodules',
        '-j8',
        'https://github.com/codersvn/sublime_extensitions',
        `${user.homedir}/.config/sublime-text-3/Packages}`
      ]);
      extension.childProcess.stderr.on('data', data => {
        if (data.indexOf('done') > -1) {
          data = _.replace(data, ', done.', '');
        }
        console.log(`${data}`);
      });
      extension.childProcess.on('close', async code => {
        await chownr(`${user.homedir}/.config/sublime-text-3/Packages`, user.uid, user.gid);
        console.log(`Install ... ${code} ${colors.green('done')}`);
      });
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      const user = linux.userInfo();
      if (osName === 'debian') {
        console.log('Clear extentions ....');
        if (!(await linux.CheckExists('subl'))) {
          throw new Exception('Sublime - text not install', 2);
        }
        if (!fs.existsSync(`${user.homedir}/.config/sublime-text-3/Packages`)) {
          fs.mkdirSync(`${user.homedir}/.config/sublime-text-3/Packages`);
        }
        await rimraf(`${user.homedir}/.config/sublime-text-3/Packages`);
        console.log(`Clear extentions .... ${colors.green('done')}`);
        const extension = spawn('git', [
          'clone',
          '--recurse-submodules',
          '-j8',
          'https://github.com/codersvn/sublime_extensitions',
          `${user.homedir}/.config/sublime-text-3/Packages}`
        ]);
        extension.childProcess.stderr.on('data', data => {
          if (data.indexOf('done') > -1) {
            data = _.replace(data, ', done.', '');
          }
          console.log(`${data}`);
        });
        extension.childProcess.on('close', async code => {
          await chownr(`${user.homedir}/.config/sublime-text-3/Packages`, user.uid, user.gid);
          console.log(`Install ... ${code} ${colors.green('done')}`);
        });
      }
      if (osName === 'redhat') {
        console.log('Clear extentions ....');
        if (!(await linux.CheckExists('subl'))) {
          throw new Exception('Sublime - text not install', 2);
        }
        if (!fs.existsSync(`${user.homedir}/.config/sublime-text-3/Packages`)) {
          fs.mkdirSync(`${user.homedir}/.config/sublime-text-3/Packages`);
        }
        await rimraf(`${user.homedir}/.config/sublime-text-3/Packages`);
        console.log(`Clear extentions .... ${colors.green('done')}`);
        const extension = spawn('git', [
          'clone',
          '--recurse-submodules',
          '-j8',
          'https://github.com/codersvn/sublime_extensitions',
          `${user.homedir}/.config/sublime-text-3/Packages}`
        ]);
        extension.childProcess.stderr.on('data', data => {
          if (data.indexOf('done') > -1) {
            data = _.replace(data, ', done.', '');
          }
          console.log(`${data}`);
        });
        extension.childProcess.on('close', async code => {
          await chownr(`${user.homedir}/.config/sublime-text-3/Packages`, user.uid, user.gid);
          console.log(`Install ... ${code} ${colors.green('done')}`);
        });
      }
    }
  }
}

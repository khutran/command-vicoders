import Install from './Install';
import fs from 'fs';
import inquirer from 'inquirer';
import colors from 'colors';
import Darwin from '../Os/Darwin';
import Linux from '../Os/Linux';
import { spawn, exec } from 'child-process-promise';

export default class InstallSubl extends Install {
  async service() {
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
    if (this.os === 'darwin') {
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      // const user = linux.userInfo();
      if (osName === 'debian') {
      }
      if (osName === 'redhat') {
      }
    }
  }
}

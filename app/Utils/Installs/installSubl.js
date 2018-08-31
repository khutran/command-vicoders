import Install from './Install';
import fs from 'fs';
import { Exception } from '@nsilly/exceptions';
import inquirer from 'inquirer';
import colors from 'colors';
import Darwin from '../Os/Darwin';
import Linux from '../Os/Linux';
// import * as _ from 'lodash';
const { spawn } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
// const rimraf = util.promisify(require('rimraf'));

export default class InstallSubl extends Install {
  service() {
    return new Promise(async (resolve, reject) => {
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
          if (darwin.CheckExists('subl')) {
            throw new Exception('You install extist sublime-text !', 1);
          }
          const subl = spawn('brew', ['cask', 'install', 'sublime-text']);
          subl.stdout.on('data', data => {
            console.log(data.toString());
          });
          subl.on('close', code => {
            if (code !== 0) {
              throw new Exception('install sublime-text fail !', 1);
            }
          });
        }
        if (this.os === 'linux') {
          const linux = new Linux();
          const osName = linux.osName();
          if (osName === 'debian') {
            if (!fs.existsSync('/usr/bin/wget')) {
              await exec('apt install -y wget');
            }
            const data = 'deb https://download.sublimetext.com/ apt/stable/';
            const sublimehq = spawn('wget', ['-qO', '-', 'https://download.sublimetext.com/sublimehq-pub.gpg']);
            const apt = spawn('apt-key', ['add', '-']);
            sublimehq.stdout.on('data', data => {
              apt.stdin.write(data);
            });
            sublimehq.on('close', code => {
              if (code === 0) {
                apt.stdin.end();
              }
            });
            apt.on('close', code => {
              if (code === 0) {
                console.log(colors.green('down sublime-text success ... done !'));
                fs.writeFile('/etc/apt/sources.list.d/sublime-text.list', data, err => {
                  if (err) {
                    throw new Exception('create file repo errro');
                  }
                  console.log(colors.green('create file repo ... success !'));
                });
              }
            });
            await exec('apt -y update');

            const sub = spawn('apt-get', ['-y', 'install', 'sublime-text']);
            sub.stdout.on('data', data => {
              console.log(data.toString());
            });
            sub.stderr.on('data', data => {
              console.log(data.toString());
            });
            sub.on('close', code => {
              if (code === 0) {
                console.log(colors.green('Install vs subl success ... !'));
              }
            });
          }
          if (osName === 'redhat') {
            await exec('rpm -v --import https://download.sublimetext.com/sublimehq-rpm-pub.gpg');
            const data =
              '[sublime-text]\nname=Sublime Text - x86_64 - Stable\nbaseurl=https://download.sublimetext.com/rpm/stable/x86_64\nenabled=1\ngpgcheck=1\ngpgkey=https://download.sublimetext.com/sublimehq-rpm-pub.gpg';
            fs.writeFile('/etc/yum.repos.d/sublime-text.repo', data, err => {
              if (err) {
                throw new Exception(colors.red('create file repo error'), 1);
              }
              console.log(colors.green('create file repo ... success !'));
            });
            await exec('yum -y update');

            const sub = spawn('yum', ['-y', 'install', 'sublime-text']);
            sub.stdout.on('data', data => {
              console.log(data.toString());
            });
            sub.stderr.on('data', data => {
              console.log(data.toString());
            });
            sub.on('close', code => {
              if (code === 0) {
                console.log(colors.green('Install vs subl success ... !'));
              }
            });
          }
        }
      } catch (e) {
        reject(e.message);
      }
    });
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

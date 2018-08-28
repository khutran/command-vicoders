import Install from './Install';
import fs from 'fs';
import { Exception } from '@codersvn/exceptions';
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

export default class InstallSubl extends Install {
  async code() {
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
          const data = 'deb https://download.sublimetext.com/ apt/stable/';
          const sublimehq = spawn('wget', ['-qO', '-', 'https://download.sublimetext.com/sublimehq-pub.gpg']);
          const apt = spawn('apt-key', ['add', '-']);
          sublimehq.stdout.on('data', data => {
            apt.stdin.write(data);
          });

          apt.on('close', code => {
            if (code === 0) {
              console.log(colors.green('down sublime-text success ... done !'));
              fs.appendFile('/etc/apt/sources.list.d/sublime-text.list', data, err => {
                if (err) {
                  throw new Exception('create file repo errro');
                }
                console.log(colors.green('create file repo ... success !'));
              });
            }
          });
          await exec('apt-get -y update');
          const code = spawn('apt-get', ['-y', 'install', 'sublime-text']);
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
        if (osName === 'redhat') {
          await exec('rpm -v --import https://download.sublimetext.com/sublimehq-rpm-pub.gpg');
          const data =
            '[sublime-text]\nname=Sublime Text - x86_64 - Stable\nbaseurl=https://download.sublimetext.com/rpm/stable/x86_64\nenabled=1\ngpgcheck=1\ngpgkey=https://download.sublimetext.com/sublimehq-rpm-pub.gpg';
          fs.appendFile('/etc/yum.repos.d/sublime-text.repo', data, err => {
            if (err) {
              throw new Exception(colors.red('create file repo error'), 1);
            }
            console.log(colors.green('create file repo ... success !'));
          });

          await exec('yum -y update');
          const code = spawn('yum', ['-y', 'install', 'sublime-text']);
          code.stdout.on('data', data => {
            console.log(data.toString());
          });
          code.stderr.on('data', data => {
            console.log(data.toString());
          });
          code.on('close', code => {
            if (code === 0) {
              console.log(colors.green('Install vs sublime-text success ... !'));
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

import { Command } from './Command';
import Os from '../../Utils/Os/Os';
import Linux from '../../Utils/Os/Linux';
import Darwin from '../../Utils/Os/Darwin';
import fs from 'fs';
import inquirer from 'inquirer';
import { dd } from 'dumper.js';
import colors from 'colors';
import installAPache from '../../Utils/Installs/installApache';
import installNginx from '../../Utils/Installs/installNginx';
import installPhp from '../../Utils/Installs/InstallPhp';
// import of from 'await-of';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const mv = util.promisify(require('mv'));
const lstat = util.promisify(fs.lstat);
const config = require(`${__dirname}/../../config/config.json`);

export default class InitCommand extends Command {
  signature() {
    return 'init';
  }

  description() {
    return 'AUTO setup vcc';
  }

  options() {}

  async handle() {
    try {
      const os = new Os().platform();
      if (os === 'darwin') {
        const user = new Darwin().userInfo();
        if (!fs.existsSync(`${user.homedir}/.npm/vcc/config.json`)) {
          await mv(`${__dirname}/../../config/config.json`, `${user.homedir}/.npm/vcc/config.json`, { mkdirp: true });
          fs.symlinkSync(`${user.homedir}/.npm/vcc/config.json`, `${__dirname}/../../config/config.json`);
        } else {
          const answers = await inquirer.prompt({ type: 'confirm', name: 'config', message: 'Config exitis - you overwrite ?', default: false });
          if (answers.config) {
            await rimraf(`${user.homedir}/.npm/vcc/config.json`);
            await mv(`${__dirname}/../../config/config.json`, `${user.homedir}/.npm/vcc/config.json`, { mkdirp: true });
            fs.symlinkSync(`${user.homedir}/.npm/vcc/config.json`, `${__dirname}/../../config/config.json`);
          } else {
            await rimraf(`${__dirname}/../../config/config.json`);
            fs.symlinkSync(`${user.homedir}/.npm/vcc/config.json`, `${__dirname}/../../config/config.json`);
          }
        }

        if (!fs.existsSync(`${user.homedir}/.npm/vcc/data/vcc.db`)) {
          await mv(`${__dirname}/../../../data/vcc.db`, `${user.homedir}/.npm/vcc/data/vcc.db`, { mkdirp: true });
          fs.symlinkSync(`${user.homedir}/.npm/vcc/data/vcc.db`, `${__dirname}/../../../data/vcc.db`);
        } else {
          const answers = await inquirer.prompt({ type: 'confirm', name: 'config', message: 'Database exitis - you overwrite ?', default: false });
          if (answers.config) {
            await rimraf(`${user.homedir}/.npm/vcc/data/vcc.db`);
            await mv(`${__dirname}/../../../data/vcc.db`, `${user.homedir}/.npm/vcc/data/vcc.db`, { mkdirp: true });
            fs.symlinkSync(`${user.homedir}/.npm/vcc/data/vcc.db`, `${__dirname}/../../../data/vcc.db`);
          } else {
            await rimraf(`${__dirname}/../../../data/vcc.db`);
            fs.symlinkSync(`${user.homedir}/.npm/vcc/data/vcc.db`, `${__dirname}/../../../data/vcc.db`);
          }
        }
        const config = require(`${__dirname}/../../config/config.json`);
        config.apache.dir_etc = '/usr/local/etc/httpd';
        config.apache.dir_conf = '/usr/local/etc/httpd/servers';
        config.nginx.dir_conf = '/usr/local/etc/nginx/servers/';
        config.nginx.dir_etc = '/usr/local/etc/nginx';

        const data = JSON.stringify(config, null, 2);
        fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        console.log(colors.green('success ... !'));
      }
      if (os === 'linux') {
        const linux = new Linux();
        const user = linux.userInfo();
        const nameOs = linux.osName();
        await linux.getPhpSock();
        if (!fs.existsSync(`${user.homedir}/.npm/vcc/config.json`)) {
          await mv(`${__dirname}/../../config/config.json`, `${user.homedir}/.npm/vcc/config.json`, { mkdirp: true });
          fs.symlinkSync(`${user.homedir}/.npm/vcc/config.json`, `${__dirname}/../../config/config.json`);
        } else {
          if (!(await lstat(`${__dirname}/../../config/config.json`)).isSymbolicLink()) {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'config', message: 'Config exitis - you overwrite ?', default: false });
            if (answers.config) {
              await rimraf(`${user.homedir}/.npm/vcc/config.json`);
              await mv(`${__dirname}/../../config/config.json`, `${user.homedir}/.npm/vcc/config.json`, { mkdirp: true });
              fs.symlinkSync(`${user.homedir}/.npm/vcc/config.json`, `${__dirname}/../../config/config.json`);
            } else {
              await rimraf(`${__dirname}/../../config/config.json`);
              fs.symlinkSync(`${user.homedir}/.npm/vcc/config.json`, `${__dirname}/../../config/config.json`);
            }
          }
        }

        if (!fs.existsSync(`${user.homedir}/.npm/vcc/data/vcc.db`)) {
          await mv(`${__dirname}/../../../data/vcc.db`, `${user.homedir}/.npm/vcc/data/vcc.db`, { mkdirp: true });
          fs.symlinkSync(`${user.homedir}/.npm/vcc/data/vcc.db`, `${__dirname}/../../../data/vcc.db`);
        } else {
          if (!(await lstat(`${__dirname}/../../../data/vcc.db`)).isSymbolicLink()) {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'config', message: 'Database exitis - you overwrite ?', default: false });
            if (answers.config) {
              await rimraf(`${user.homedir}/.npm/vcc/data/vcc.db`);
              await mv(`${__dirname}/../../../data/vcc.db`, `${user.homedir}/.npm/vcc/data/vcc.db`, { mkdirp: true });
              fs.symlinkSync(`${user.homedir}/.npm/vcc/data/vcc.db`, `${__dirname}/../../../data/vcc.db`);
            } else {
              await rimraf(`${__dirname}/../../../data/vcc.db`);
              fs.symlinkSync(`${user.homedir}/.npm/vcc/data/vcc.db`, `${__dirname}/../../../data/vcc.db`);
            }
          }
        }

        if (nameOs === 'debian') {
          if (await linux.CheckExists('apache2')) {
            if (!fs.existsSync('/etc/apache2/conf.d')) {
              fs.mkdirSync('/etc/apache2/conf.d');
            }
            config.apache.dir_etc = '/etc/apache2';
            config.apache.dir_conf = '/etc/apache2/conf.d';
          } else {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you have want install apache2 ?', default: false });
            if (answers.install) {
              await new installAPache().service('2.4.34');
              config.apache.dir_etc = '/etc/apache2';
              config.apache.dir_conf = '/etc/apache2/sites-enabled';
            }
          }

          if (await linux.CheckExists('nginx')) {
            if (!fs.existsSync('/etc/nginx/conf.d')) {
              fs.mkdirSync('/etc/nginx/conf.d');
            }
            config.nginx.dir_conf = '/etc/nginx/conf.d';
            config.nginx.dir_etc = '/etc/nginx';
          } else {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you have want install nginx ?', default: false });
            if (answers.install) {
              await new installNginx().service();
              config.nginx.dir_conf = '/etc/nginx/conf.d';
              config.nginx.dir_etc = '/etc/nginx';
            }
          }

          if (!(await linux.CheckExists('php'))) {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you have want install PHP ?', default: false });
            if (answers.install) {
              await new installPhp().service('7.2');
            }
          }

          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
          console.log(colors.green('success ... !'));
        }

        if (nameOs === 'redhat') {
          if (await linux.CheckExists('httpd')) {
            config.apache.dir_etc = '/etc/httpd';
            config.apache.dir_conf = '/etc/httpd/conf.d';
          } else {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you have want install apache ?', default: false });
            if (answers.install) {
              await new installAPache().service();
              config.apache.dir_etc = '/etc/httpd';
              config.apache.dir_conf = '/etc/httpd/conf.d';
            }
          }

          if (await linux.CheckExists('nginx')) {
            if (!fs.existsSync('/etc/nginx/conf.d')) {
              fs.mkdirSync('/etc/nginx/conf.d');
            }
            config.nginx.dir_conf = '/etc/nginx/conf.d';
            config.nginx.dir_etc = '/etc/nginx';
          } else {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you have want install nginx ?', default: false });
            if (answers.install) {
              await new installNginx().service();
              config.nginx.dir_conf = '/etc/nginx/conf.d';
              config.nginx.dir_etc = '/etc/nginx';
            }
          }

          if (!(await linux.CheckExists('php'))) {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you have want install PHP ?', default: false });
            if (answers.install) {
              await new installPhp().service('7.2');
            }
          }

          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
          console.log(colors.green('success ... !'));
        }
      }
    } catch (e) {
      dd(colors.red(e.message));
    }
  }
}

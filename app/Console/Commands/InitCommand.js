import { Command } from './Command';
import Os from '../../Utils/Os/Os';
import Linux from '../../Utils/Os/Linux';
import Darwin from '../../Utils/Os/Darwin';
import fs from 'fs';
import inquirer from 'inquirer';
import colors from 'colors';
import { Exception } from '@nsilly/exceptions';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const mv = util.promisify(require('mv'));
const lstat = util.promisify(fs.lstat);

export default class InitCommand extends Command {
  signature() {
    // The command signature is required
    // You may pass how many argument you want
    return 'init';
  }

  description() {
    // Description is optional
    return 'AUTO setup vcc';
  }

  options() {
    // The array of your option, it's optional
    // There are two types of options: those that receive a value and those that don't.
    // If the option_name come with ? at the end, it mean this option don't want to receive any value, it will be boolean value
    // Now command support max 6 options
    // return [{ key: 'option_name?', description: 'The description for option here' }];
  }

  async handle() {
    try {
      const os = new Os().platform();
      if (os === 'darwin') {
        const user = new Darwin().userInfo();

        if ((await lstat(`${__dirname}/../../config/config.json`)).isSymbolicLink()) {
          throw new Exception('vcc exitis init', 1);
        }

        if ((await lstat(`${__dirname}/../../../data/vcc.db`)).isSymbolicLink()) {
          throw new Exception('vcc exitis init', 1);
        }

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
        config.apache.dir_home = '/usr/local/etc/httpd';
        config.nginx.dir_home = '/usr/local/etc/nginx';
        config.nginx.dir_etc = '/usr/local/etc/nginx';

        const data = JSON.stringify(config, null, 2);
        fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        console.log(colors.green('success ... !'));
      }
      if (os === 'linux') {
        const user = new Linux().userInfo();
        if ((await lstat(`${__dirname}/../../config/config.json`)).isSymbolicLink()) {
          throw new Exception('vcc exitis init', 1);
        }

        if ((await lstat(`${__dirname}/../../../data/vcc.db`)).isSymbolicLink()) {
          throw new Exception('vcc exitis init', 1);
        }

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
        config.apache.dir_home = '/usr/local/httpd';
        config.apache.dir_bin = '/usr/local/httpd/bin/httpd';
        config.apache.dir_systemd = '/lib/systemd/system';
        config.apache.dir_etc = '/usr/local/httpd';
        config.nginx.dir_home = '/usr/local/nginx';
        config.nginx.dir_bin = '/usr/local/nginx/bin/nginx';
        config.nginx.dir_systemd = '/lib/systemd/system';
        config.nginx.dir_etc = '/etc/nginx';

        const data = JSON.stringify(config, null, 2);
        fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        console.log(colors.green('success ... !'));
      }
    } catch (e) {
      throw new Exception(e.message, 1);
    }
  }
}

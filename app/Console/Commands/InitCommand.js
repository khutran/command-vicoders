import { Command } from './Command';
import Os from '../../Utils/Os/Os';
import Linux from '../../Utils/Os/Linux';
import Darwin from '../../Utils/Os/Darwin';
import fs from 'fs';
import inquirer from 'inquirer';
import { Exception } from '@nsilly/exceptions';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const mv = util.promisify(require('mv'));

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
    const os = new Os().platform();
    if (os === 'darwin') {
      const user = new Darwin().userInfo();
      if (fs.stats.isSymbolicLink(`${__dirname}/../../config/config.json`)) {
        throw new Exception('vcc exitis init', 1);
      }

      if (fs.stats.isSymbolicLink(`${__dirname}/../../../data/vcc.db`)) {
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
        const answers = await inquirer.prompt({ type: 'confirm', name: 'config', message: 'Config exitis - you overwrite ?', default: false });
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
    if (os === 'linux') {
      const user = new Linux().userInfo();
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
        const answers = await inquirer.prompt({ type: 'confirm', name: 'config', message: 'Config exitis - you overwrite ?', default: false });
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
  }
}

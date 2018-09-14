import { Command } from './Command';
import fs from 'fs';
import config from '../../config/config.json';
import { Exception } from '@nsilly/exceptions';
import colors from 'colors';

export default class ConfigCommand extends Command {
  signature() {
    // The command signature is required
    // You may pass how many argument you want
    return 'config';
  }

  description() {
    // Description is optional
    return 'The description for your command here';
  }

  options() {
    // The array of your option, it's optional
    // There are two types of options: those that receive a value and those that don't.
    // If the option_name come with ? at the end, it mean this option don't want to receive any value, it will be boolean value
    // Now command support max 6 options
    return [
      { key: 'dir_home_apache', description: 'Setup path home apache' },
      { key: 'dir_home_nginx', description: 'Setup path home nginx' },
      { key: 'sql_lite_path', description: 'Setup path mysql file' }
    ];
  }

  async handle(option) {
    try {
      console.log(option.options);
      if (option.dir_home_apache) {
        config.dir_home_apache = option.dir_home_apache;
      }
      if (option.dir_home_nginx) {
        config.dir_home_nginx = option.dir_home_nginx;
      }
      if (option.sql_lite_path) {
        config.sql_lite_path = option.sql_lite_path;
      }
      const data = JSON.stringify(config, null, 2);
      fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
      console.log(colors.green('success ... !'));
    } catch (e) {
      throw new Exception(e.message, 1);
    }
  }
}

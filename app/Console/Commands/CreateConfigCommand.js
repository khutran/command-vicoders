import { Command } from './Command';
import ProjectRepository from '../../Repositories/ProjectRepository';
import { Exception } from '@nsilly/exceptions';
import colors from 'colors';
import _ from 'lodash';
import fs from 'fs';
import Os from '../../Utils/Os/Os';
import config from '../../config/config.json';

const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class CreateProjectCommand extends Command {
  signature() {
    return 'create-config <project>';
  }

  description() {
    return 'Create config nginx and apache project';
  }

  options() {
    return [];
  }

  async handle(project) {
    try {
      if (_.isEmpty(config.nginx.dir_home) || _.isEmpty(config.apache.dir_home)) {
        throw new Exception('vcc config --dir_home_apache "/path" --dir_home_nginx "/paths"  || vcc init');
      }
      const repository = new ProjectRepository();
      const item = await repository
        .orWhere('name', 'like', project)
        .orWhere('id', 'like', project)
        .first();

      if (!item) {
        throw new Exception(`Project ${project} not exitis`);
      }

      const os = new Os().platform();
      if (os === 'darwin') {
        if (item.framework !== 'nodejs') {
          const config_apache = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-apache.conf`);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('xxx.com', 'g'), item.name);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('/path', 'g'), item.dir_home);

          fs.writeFile(`${config.apache.dir_home}/conf.d/apache-${item.name}.conf`, config_apache.stdout, err => {
            if (err) {
              throw new Exception(err.message);
            }
            console.log(colors.green(`${config.apache.dir_home}/conf.d/apache-${item.name}.conf`));
          });
        }

        const config_nginx = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-nginx.conf`);
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('xxx.com', 'g'), item.name);
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('/path', 'g'), item.dir_home);
        if (item.port !== 80) {
          config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('3000', 'g'), item.port);
        }

        fs.writeFile(`${config.nginx.dir_etc}/servers/nginx-${item.name}.conf`, config_nginx.stdout, err => {
          if (err) {
            throw new Exception(err.message);
          }
          console.log(colors.green(`${config.nginx.dir_etc}/servers/nginx-${item.name}.conf`));
          console.log(colors.green('Create success ... !'));
        });
      }
      if (os === 'linux') {
        if (item.framework !== 'nodejs') {
          const config_apache = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-apache.conf`);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('xxx.com', 'g'), item.name);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('/path', 'g'), item.dir_home);

          fs.writeFile(`${config.apache.dir_etc}/conf/extra/web/apache-${item.name}.conf`, config_apache.stdout, err => {
            if (err) {
              throw new Exception(err.message);
            }
            console.log(colors.green(`${config.apache.dir_etc}/conf/extra/web/apache-${item.name}.conf`));
          });
        }

        const config_nginx = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-nginx.conf`);
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('xxx.com', 'g'), item.name);
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('/path', 'g'), item.dir_home);
        if (item.port !== 80) {
          config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('3000', 'g'), item.port);
        }
        fs.writeFile(`${config.nginx.dir_etc}/conf.d/nginx-${item.name}.conf`, config_nginx.stdout, err => {
          if (err) {
            throw new Exception(err.message);
          }
          console.log(colors.green(`${config.nginx.dir_etc}/conf.d/nginx-${item.name}.conf`));
          console.log(colors.green('Create success ... !'));
        });
      }
    } catch (e) {
      console.log(colors.red(e.message));
    }
  }
}

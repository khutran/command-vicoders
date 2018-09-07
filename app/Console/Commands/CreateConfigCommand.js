import { Command } from './Command';
import ProjectRepository from '../../Repositories/ProjectRepository';
import { Exception } from '@nsilly/exceptions';
import colors from 'colors';
import _ from 'lodash';
import fs from 'fs';
import Os from '../../Utils/Os/Os';
import Darwin from '../../Utils/Os/Darwin';
import Linux from '../../Utils/Os/Linux';
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

          fs.writeFile(`/usr/local/etc/httpd/conf.d/apache-${item.name}.conf`, config_apache.stdout, err => {
            if (err) {
              throw new Exception(err.message);
            }
            console.log(colors.green(`/usr/local/etc/httpd/conf.d/apache-${item.name}.conf`));
          });
        }

        const config_nginx = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-nginx.conf`);
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('xxx.com', 'g'), item.name);
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('/path', 'g'), item.dir_home);
        if (item.port !== 80) {
          config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('3000', 'g'), item.port);
        }

        fs.writeFile(`/usr/local/etc/nginx/servers/nginx-${item.name}.conf`, config_nginx.stdout, err => {
          if (err) {
            throw new Exception(err.message);
          }
          console.log(colors.green(`/usr/local/etc/nginx/servers/nginx-${item.name}.conf`));
          console.log(colors.green('Create success ... !'));
        });
      }
      if (os === 'linux') {
        if (item.framework !== 'nodejs') {
          const config_apache = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-apache.conf`);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('xxx.com', 'g'), item.name);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('/path', 'g'), item.dir_home);

          fs.writeFile(`/usr/local/apache/conf/extra/web/apache-${item.name}.conf`, config_apache.stdout, err => {
            if (err) {
              throw new Exception(err.message);
            }
            console.log(colors.green(`/usr/local/apache/conf/extra/web/apache-${item.name}.conf`));
          });
        }

        const config_nginx = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-nginx.conf`);
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('xxx.com', 'g'), item.name);
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('/path', 'g'), item.dir_home);
        if (item.port !== 80) {
          config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('3000', 'g'), item.port);
        }
        fs.writeFile(`/etc/nginx/conf.d/nginx-${item.name}.conf`, config_nginx.stdout, err => {
          if (err) {
            throw new Exception(err.message);
          }
          console.log(colors.green(`/etc/nginx/conf.d/nginx-${item.name}.conf`));
          console.log(colors.green('Create success ... !'));
        });
      }
    } catch (e) {
      console.log(colors.red(e.message));
    }
  }
}

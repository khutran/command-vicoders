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
        const nginx_content = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-apache-conf`);
        nginx_content.stdout = _.replace(nginx_content.stdout, new RegExp('xxx.com', 'g'), item.name);
        nginx_content.stdout = _.replace(nginx_content.stdout, new RegExp('/path', 'g'), item.dir_home);
        if (item.port !== 80) {
          nginx_content.stdout = _.replace(nginx_content.stdout, new RegExp('3000', 'g'), item.port);
        }

        fs.writeFile(`/usr/local/etc/nginx/servers/nginx-${item.name}.conf`, nginx_content.stdout, err => {
          if (err) {
            throw new Exception(err.message);
          }
        });

        if (item.framework !== 'nodejs') {
          const apache_content = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-apache.conf`);
          apache_content.stdout = _.replace(apache_content.stdout, new RegExp('xxx.com', 'g'), item.name);
          apache_content.stdout = _.replace(apache_content.stdout, new RegExp('/path', 'g'), item.dir_home);

          fs.writeFile(`/usr/local/etc/httpd/conf.d/apache-${item.name}.conf`, nginx_content.stdout, err => {
            if (err) {
              throw new Exception(err.message);
            }
          });
        }
      }
      if (os === 'linux') {
        const nginx_content = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-nginx-conf`);
        nginx_content.stdout = _.replace(nginx_content.stdout, new RegExp('xxx.com', 'g'), item.name);
        nginx_content.stdout = _.replace(nginx_content.stdout, new RegExp('/path', 'g'), item.dir_home);
        if (item.port !== 80) {
          nginx_content.stdout = _.replace(nginx_content.stdout, new RegExp('3000', 'g'), item.port);
        }
        fs.writeFile(`/etc/nginx/conf.d/nginx-${item.name}.conf`, nginx_content.stdout, err => {
          if (err) {
            throw new Exception(err.message);
          }
        });

        if (item.framework !== 'nodejs') {
          const apache_content = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-apache.conf`);
          apache_content.stdout = _.replace(apache_content.stdout, new RegExp('xxx.com', 'g'), item.name);
          apache_content.stdout = _.replace(apache_content.stdout, new RegExp('/path', 'g'), item.dir_home);

          fs.writeFile(`/etc/httpd/conf.d/apache-${item.name}.conf`, nginx_content.stdout, err => {
            if (err) {
              throw new Exception(err.message);
            }
          });
        }
      }
    } catch (e) {
      console.log(colors.red(e.message));
    }
  }
}

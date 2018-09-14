import { Command } from './Command';
import ProjectRepository from '../../Repositories/ProjectRepository';
import colors from 'colors';
import _ from 'lodash';
import fs from 'fs';
import Os from '../../Utils/Os/Os';
import config from '../../config/config.json';
import { dd } from 'dumper.js';
import { exec } from 'child-process-promise';
import inquirer from 'inquirer';
import installAPache from '../../Utils/Installs/installApache';
import of from 'await-of';
import installNginx from '../../Utils/Installs/installNginx';
import Darwin from '../../Utils/Os/Darwin';
import Linux from '../../Utils/Os/Linux';

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
      const os = new Os().platform();
      let platform;
      if (os === 'darwin') {
        platform = new Darwin();
      }
      if (os === 'linux') {
        platform = new Linux();
      }

      const repository = new ProjectRepository();
      const item = await repository
        .orWhere('name', 'like', project)
        .orWhere('id', 'like', project)
        .first();

      if (!item) {
        dd(`Project ${project} not exitis`);
      }

      if (config.service_nginx === 'false' || !platform.CheckExists('nginx')) {
        const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you want install nginx : ', default: true });
        if (answers.install) {
          const install = new installNginx();
          await of(install.service());
        }
      }

      if (config.service_apache === 'false' || !platform.CheckExists('httpd')) {
        const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you want install apache : ', default: true });
        if (answers.install) {
          const install = new installAPache();
          config.service_apache = 'true';
          await of(install.service('2.4.34'));
        }
      }

      if (_.isNil(item.framework)) {
        const framework = {
          1: 'wordpress',
          2: 'laravel',
          3: 'nodejs',
          4: 'angular'
        };
        _.mapKeys(framework, (value, key) => {
          console.log(`${key} : ${value}`);
        });
        const answers = await inquirer.prompt({ type: 'input', name: 'key', message: 'select frame of project' });
        item.framework = framework[answers.key];
        await item.update({ framework: item.framework });
      }

      let apache = 'disable';
      if (config.service_apache === 'true') {
        apache = 'enable';
      }

      if (item.framework !== 'nodejs') {
        if (apache === 'enable') {
          const config_apache = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-apache.conf`);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('xxx.com', 'g'), item.name);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('/path', 'g'), item.dir_home);
          fs.writeFileSync(`${config.apache.dir_conf}/apache-${item.name}.conf`, config_apache.stdout);
          console.log(colors.green(`${config.apache.dir_conf}/apache-${item.name}.conf`));
        }
      }

      const config_nginx = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-nginx.conf`);
      config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('xxx.com', 'g'), item.name);
      config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('/path', 'g'), item.dir_home);
      if (item.port !== 80) {
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('3000', 'g'), item.port);
      }

      if (apache === 'enable') {
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('#includeApache', 'g'), 'proxy_pass http://apache;');
        if (item.framework === 'angular') {
          const answers = await inquirer.prompt({ type: 'confirm', name: 'bool', message: 'you want use apache', default: true });
          if (!answers.bool) {
            config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('proxy_pass http://apache', 'g'), 'proxy_pass http://web');
          }
        }
      }

      if (item.framework === 'angular') {
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('#includeApache', 'g'), 'proxy_pass http://web');
      }

      fs.writeFile(`${config.nginx.dir_conf}/nginx-${item.name}.conf`, config_nginx.stdout, err => {
        if (err) {
          dd(err.message);
        }
        console.log(colors.green(`${config.nginx.dir_conf}/nginx-${item.name}.conf`));
        console.log(colors.green('Create success ... !'));
      });
    } catch (e) {
      dd(colors.red(e.message));
    }
  }
}

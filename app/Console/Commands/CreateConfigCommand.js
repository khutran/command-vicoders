import { Command } from './Command';
import ProjectRepository from '../../Repositories/ProjectRepository';
import colors from 'colors';
import * as _ from 'lodash';
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

export default class CreateConfigCommand extends Command {
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
      let name_apache;
      let check_apache;
      if (os === 'win32') {
        console.log('command vcc not support create config webserver in windown ... !');
      }
      if (os === 'darwin') {
        platform = new Darwin();

        if (_.isEmpty(config.nginx.dir_conf)) {
          config.nginx.dir_conf = '/usr/local/etc/nginx/servers';
        }
        if (_.isEmpty(config.nginx.dir_etc)) {
          config.nginx.dir_etc = '/usr/local/etc/nginx';
        }
        if (_.isEmpty(config.apache.dir_conf)) {
          config.apache.dir_conf = '/usr/local/etc/apache2/servers';
        }
        if (_.isEmpty(config.apache.dir_etc)) {
          config.apache.dir_etc = '/usr/local/etc/apache2/servers';
        }
      }
      if (os === 'linux') {
        platform = new Linux();

        if (platform.osName() === 'debian') {
          name_apache = 'apache2';
          check_apache = await platform.CheckExists(name_apache);
          if (!check_apache) {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you want install apache : ', default: true });
            if (answers.install) {
              const install = new installAPache();
              await of(install.service('2.4.34'));
            }
          }
        }

        if (platform.osName() === 'redhat') {
          name_apache = 'httpd';
          check_apache = await platform.CheckExists(name_apache);
          if (!check_apache) {
            const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you want install apache : ', default: true });
            if (answers.install) {
              const install = new installAPache();
              await of(install.service('2.4.34'));
            }
          }
        }

        if (_.isEmpty(config.nginx.dir_conf)) {
          config.nginx.dir_conf = '/etc/nginx/conf.d';
        }
        if (_.isEmpty(config.nginx.dir_etc)) {
          config.nginx.dir_etc = '/etc/nginx';
        }
        if (_.isEmpty(config.apache.dir_conf)) {
          config.apache.dir_conf = '/etc/apache2/sites-enabled';
        }
        if (_.isEmpty(config.apache.dir_etc)) {
          config.apache.dir_etc = '/etc/apache2';
        }
      }

      if (!(await platform.CheckExists('nginx'))) {
        const answers = await inquirer.prompt({ type: 'confirm', name: 'install', message: 'you want install nginx : ', default: true });
        if (answers.install) {
          const install = new installNginx();
          await of(install.service());
        }
      }

      const repository = new ProjectRepository();

      if (!project) {
        const list = await repository.get();
        _.map(list, value => {
          console.log(`${value.id} : ${colors.green(value.name)}`);
        });

        const as = await inquirer.prompt({ type: 'input', name: 'project', message: 'Select project  : ' });

        if (as.project) {
          project = as.project;
        }
      }

      const item = await repository
        .orWhere('name', 'like', project)
        .orWhere('id', 'like', project)
        .first();

      if (!item) {
        dd(`Project ${project} not exitis`);
      }

      const answers = await inquirer.prompt({ type: 'input', name: 'domain', message: 'Domain : ', default: item.name });

      if (answers.domain) {
        item.name = answers.domain;
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

      if (!fs.existsSync(`${config.nginx.dir_conf}/upstream.conf`)) {
        const upstream = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/upstream.conf`);
        fs.writeFileSync(`${config.nginx.dir_conf}/upstream.conf`, upstream.stdout);
      }

      if (!fs.existsSync(`${config.nginx.dir_etc}/ssl/certificate.pem`)) {
        if (!fs.existsSync(`${config.nginx.dir_etc}/ssl`)) {
          fs.mkdirSync(`${config.nginx.dir_etc}/ssl`);
        }
        const certificate = await exec('curl https://raw.githubusercontent.com/khutran/config_web/master/ssl/certificate.pem');
        fs.writeFileSync(`${config.nginx.dir_etc}/ssl/certificate.pem`, certificate.stdout);
      }
      if (!fs.existsSync(`${config.nginx.dir_etc}/ssl/key.pem`)) {
        const key = await exec('curl https://raw.githubusercontent.com/khutran/config_web/master/ssl/key.pem');
        fs.writeFileSync(`${config.nginx.dir_etc}/ssl/key.pem`, key.stdout);
      }

      let apache = { status: false };
      if (check_apache) {
        apache = await inquirer.prompt({ type: 'confirm', name: 'status', message: 'You have want use apache : ', default: true });
      }
      let config_apache;
      if (item.framework !== 'nodejs') {
        if (apache.status) {
          config_apache = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-apache.conf`);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('xxx.com', 'g'), item.name);
          config_apache.stdout = _.replace(config_apache.stdout, new RegExp('/path', 'g'), item.dir_home);
          if (platform.osName() === 'debian') {
            config_apache.stdout = _.replace(config_apache.stdout, new RegExp('httpd', 'g'), 'apache2');
          }
        }
      }

      const config_nginx = await exec(`curl https://raw.githubusercontent.com/khutran/config_web/master/default-${item.framework}-nginx.conf`);
      config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('xxx.com', 'g'), item.name);
      config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('/path', 'g'), item.dir_home);
      if (item.port !== 80) {
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('3000', 'g'), item.port);
      }

      if (apache.status) {
        config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('#includeApache', 'g'), 'proxy_pass http://apache');
        if (item.framework === 'angular') {
          const answers = await inquirer.prompt({ type: 'confirm', name: 'bool', message: 'you want use port 4200 ? :', default: true });
          if (answers.bool) {
            if (config_nginx.stdout.includes('#includeApache')) {
              config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('#includeAngular', 'g'), 'proxy_pass http://web');
            } else {
              config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('proxy_pass http://apache', 'g'), 'proxy_pass http://web');
            }
          }
        }
      } else {
        if (item.framework === 'angular') {
          const answers = await inquirer.prompt({ type: 'confirm', name: 'bool', message: 'you want use port 4200 ? :', default: true });
          if (answers.bool) {
            config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('#includeAngular', 'g'), 'proxy_pass http://web');
          }
        } else {
          config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('#includeNginx', 'g'), 'try_files $uri $uri/ /index.php?$query_string');
        }
      }

      if (await platform.CheckExists('php')) {
        if (_.isEmpty(config.connectPhp)) {
          config.connectPhp = await platform.getPhpSock();
          if (_.isEmpty(config.connectPhp)) {
            const answers = await inquirer.prompt({ type: 'input', name: 'path', message: 'input method connect php-fpm : ', default: '127.0.0.1:9000' });
            config.connectPhp = answers.path;
          }
        }
      }

      config_nginx.stdout = _.replace(config_nginx.stdout, new RegExp('#connectPhp', 'g'), config.connectPhp);

      const addHost = await inquirer.prompt({ type: 'confirm', name: 'add', message: 'you want add domain to file host "/etc/hosts" : ', default: true });
      if (addHost.add) {
        fs.appendFileSync('/etc/hosts', `\n127.0.0.1 ${item.name}`);
      }

      if (config_apache) {
        if (platform.osName() === 'redhat') {
          fs.writeFileSync(`${config.apache.dir_conf}/apache-${item.name}.conf`, config_apache.stdout);
          console.log(colors.green(`${config.apache.dir_conf}/apache-${item.name}.conf`));
        }
        if (platform.osName() === 'dibian') {
          fs.writeFileSync(`${config.apache.dir_conf}/apache-${item.name}`, config_apache.stdout);
          console.log(colors.green(`${config.apache.dir_conf}/apache-${item.name}`));
        }
      }

      fs.writeFileSync(`${config.nginx.dir_conf}/nginx-${item.name}.conf`, config_nginx.stdout);
      console.log(colors.green(`${config.nginx.dir_conf}/nginx-${item.name}.conf`));

      const data = JSON.stringify(config, null, 2);
      fs.writeFileSync(`${__dirname}/../../config/config.json`, data);

      if (platform.osName() === 'debian') {
        await exec('nginx -s reload');
        if (config_apache) {
          await exec('apache2 -k restart');
        }
      } else if (platform.osName() === 'redhat') {
        await exec('nginx -s reload');
        if (config_apache) {
          await exec('httpd -k restart');
        }
      }

      console.log(colors.green('Create success ... !'));
    } catch (e) {
      dd(colors.red(e.message));
    }
  }
}

import Install from './Install';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import fs from 'fs';
import config from '../../config/config.json';
import of from 'await-of';
import _ from 'lodash';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);

// import Darwin from '../Os/Darwin';

export default class installNginx extends Install {
  async service() {
    if (this.os === 'darwin') {
      return 'https://www.sylvaindurand.org/setting-up-a-nginx-web-server-on-macos/';
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      // http://sharadchhetri.com/2018/05/15/install-and-compile-nginx-1-14-on-ubuntu-18-04-lts-server/

      if (osName === 'debian') {
        try {
          if (_.isEmpty(config.nginx.dir_etc) || !config.nginx.dir_etc) {
            config.nginx.dir_etc = '/etc/nginx';
          }

          if (_.isEmpty(config.nginx.dir_conf) || !config.nginx.dir_conf) {
            config.nginx.dir_conf = '/etc/nginx/conf.d';
          }

          console.log('Install lib... !');
          await exec(
            'apt install -y gcc libpcre3-dev zlib1g-dev libssl-dev libxml2-dev libxslt1-dev  libgd-dev google-perftools libgoogle-perftools-dev libperl-dev libgeoip-dev libatomic-ops-dev'
          );
          await exec('apt install -y software-properties-common');
          await of(exec('add-apt-repository -y ppa:nginx/stable'));
          await exec('apt -y update');
          console.log('install nginx ... !');
          await exec('apt install -y nginx');
          const nginx = await exec('curl https://raw.githubusercontent.com/khutran/config_web/master/nginx.conf');
          await rimraf(`${config.nginx.dir_etc}/nginx.conf`);

          fs.writeFileSync(`${config.nginx.dir_etc}/nginx.conf`, nginx.stdout);
          if (!fs.existsSync(`${config.nginx.dir_conf}/ssl/certificate.pem`)) {
            if (!fs.existsSync(`${config.nginx.dir_conf}/ssl`)) {
              fs.mkdirSync(`${config.nginx.dir_conf}/ssl`);
            }
            const certificate = await exec('curl https://raw.githubusercontent.com/khutran/config_web/master/ssl/certificate.pem');
            fs.writeFileSync(`${config.nginx.dir_conf}/ssl/certificate.pem`, certificate.stdout);
          }
          if (!fs.existsSync(!fs.existsSync(`${config.nginx.dir_conf}/ssl/key.pem`))) {
            const key = await exec('curl https://raw.githubusercontent.com/khutran/config_web/master/ssl/key.pem');
            fs.writeFileSync(`${config.nginx.dir_conf}/ssl/key.pem`, key.stdout);
          }
          console.log('install .... OK 1');

          config.nginx.dir_etc = '/etc/nginx';
          config.nginx.dir_conf = '/etc/nginx/conf.d';
          config.service_nginx = 'true';
          console.log(config);
          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
      if (osName === 'redhat') {
        try {
          if (_.isEmpty(config.nginx.dir_etc) || !config.nginx.dir_etc) {
            config.nginx.dir_etc = '/etc/nginx';
          }

          if (_.isEmpty(config.nginx.dir_conf) || !config.nginx.dir_conf) {
            config.nginx.dir_conf = '/etc/nginx/conf.d';
          }

          console.log('Install lib... !');
          await exec('yum install -y gcc openssl-devel apr apr-util');
          await exec('yum install -y epel-release');
          await exec('yum install -y nginx');
          const nginx = await exec('curl https://raw.githubusercontent.com/khutran/config_web/master/nginx.conf');
          await rimraf(`${config.nginx.dir_etc}/nginx.conf`);

          fs.writeFileSync(`${config.nginx.dir_etc}/nginx.conf`, nginx.stdout);
          if (!fs.existsSync(`${config.nginx.dir_conf}/ssl/certificate.pem`)) {
            if (!fs.existsSync(`${config.nginx.dir_conf}/ssl`)) {
              fs.mkdirSync(`${config.nginx.dir_conf}/ssl`);
            }
            const certificate = await exec('curl https://raw.githubusercontent.com/khutran/config_web/master/ssl/certificate.pem');
            fs.writeFileSync(`${config.nginx.dir_conf}/ssl/certificate.pem`, certificate.stdout);
          }
          if (!fs.existsSync(!fs.existsSync(`${config.nginx.dir_conf}/ssl/key.pem`))) {
            const key = await exec('curl https://raw.githubusercontent.com/khutran/config_web/master/ssl/key.pem');
            fs.writeFileSync(`${config.nginx.dir_conf}/ssl/key.pem`, key.stdout);
          }
          console.log('install .... OK 1');

          config.nginx.dir_etc = '/etc/nginx';
          config.nginx.dir_conf = '/etc/nginx/conf.d';
          config.service_nginx = 'true';
          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
    }
  }
}

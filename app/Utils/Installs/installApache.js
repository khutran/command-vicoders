import Install from './Install';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import fs from 'fs';
import config from '../../config/config.json';
import _ from 'lodash';
import { exec } from 'child-process-promise';

export default class installAPache extends Install {
  async service() {
    if (this.os === 'darwin') {
      return 'https://www.sylvaindurand.org/setting-up-a-apache-web-server-on-macos/';
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();

      if (osName === 'debian') {
        try {
          config.apache.dir_etc = !_.isEmpty(config.apache.dir_etc) ? config.apache.dir_etc : '/etc/apache2';

          config.apache.dir_conf = !_.isEmpty(config.apache.dir_conf) ? config.apache.dir_conf : '/etc/apache2/sites-enabled';

          console.log('Install module ... !');
          await exec('apt-get -y update');
          await exec(
            'apt-get install -y gcc libapr1 libapr1-dev libaprutil1-dev libpcre3-dev zlib1g-dev libssl-dev libxml2-dev libxslt1-dev  libgd-dev google-perftools libgoogle-perftools-dev libperl-dev libgeoip-dev libatomic-ops-dev'
          );
          console.log('install apache2 ... !');
          await exec('apt-get -y install apache2');
          let port = fs.readFileSync(`${config.apache.dir_etc}/ports.conf`);
          port = _.replace(port, new RegExp('80', 'g'), '6669');
          fs.writeFileSync(`${config.apache.dir_etc}/ports.conf`, port);
          let file = fs.readFileSync(`${config.apache.dir_etc}/apache2.conf`);
          // file = _.replace(file, new RegExp('${APACHE_PID_FILE}', 'g'), '/var/run/apache2/apache2.pid');
          // file = _.replace(file, new RegExp(`\$\{APACHE\_LOCK\_DIR\}`, 'g'), '/var/lock/apache2');
          // file = _.replace(file, new RegExp(`\$\{APACHE\_LOG\_DIR\}`, 'g'), '/var/log/apache2');
          // file = _.replace(file, new RegExp(`\$\{APACHE\_RUN\_DIR\}`, 'g'), '/var/run/apache2');
          // file = _.replace(file, new RegExp(`\$\{APACHE\_RUN\_GROUP\}`, 'g'), 'www-data');
          // file = _.replace(file, new RegExp(`\$\{APACHE\_RUN\_USER\}`, 'g'), 'www-data');
          console.log(file);
          // fs.writeFileSync(`${config.apache.dir_etc}/apache2.conf`, file);
          fs.appendFileSync(`${config.apache.dir_etc}/apache2.conf`, 'ServerName "http://localhost"');

          if (!fs.existsSync('/var/lock/apache2')) {
            fs.mkdirSync('/var/lock/apache2');
          }
          await exec('apache2 -k start');
          await exec('systemctl enable apache2');
          console.log('install ... OK');
          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
      if (osName === 'redhat') {
        try {
          config.apache.dir_etc = !_.isEmpty(config.apache.dir_etc) ? config.apache.dir_etc : '/etc/httpd';

          config.apache.dir_conf = !_.isEmpty(config.apache.dir_conf) ? config.apache.dir_conf : '/etc/httpd/conf.d';
          console.log('Install module ... !');
          await exec('yum install -y gcc openssl-devel apr apr-util wget');

          console.log('Install apache... !');
          await exec('yum install -y yum-changelog');
          await exec('yum changelog httpd');
          await exec('yum install -y epel-release');
          await exec('wget https://repo.codeit.guru/codeit.el`rpm -q --qf "%{VERSION}" $(rpm -q --whatprovides redhat-release)`.repo -P /etc/yum.repos.d');
          await exec('yum install -y httpd');

          let file = fs.readFileSync(`${config.apache.dir_etc}/conf/httpd.conf`);
          file = _.replace(file, new RegExp('80', 'g'), '6669');
          fs.writeFileSync(`${config.apache.dir_etc}/conf/httpd.conf`, file);
          await exec('httpd -k start');
          await exec('systemctl enable httpd');
          console.log('install ... OK');
          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
    }
  }
}

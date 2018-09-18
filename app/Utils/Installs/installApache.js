import Install from './Install';
import decompress from 'decompress';
import path from 'path';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import fs from 'fs';
import { App } from '@nsilly/container';
import { Downloader } from '../Downloader';
import config from '../../config/config.json';
import _ from 'lodash';
import { exec } from 'child-process-promise';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const mv = util.promisify(require('mv'));

export default class installAPache extends Install {
  async service(version) {
    if (this.os === 'darwin') {
      return 'https://www.sylvaindurand.org/setting-up-a-apache-web-server-on-macos/';
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();

      if (osName === 'debian') {
        try {
          config.apache.dir_etc = !_.isNil(config.apache.dir_etc) ? config.apache.dir_etc : '/etc/apache2';

          config.apache.dir_conf = !_.isNil(config.apache.dir_conf) ? config.apache.dir_conf : '/etc/apache2/conf.d';

          console.log('Install module ... !');
          await exec('apt-get -y update');
          await exec(
            'apt-get install -y gcc libapr1 libapr1-dev libaprutil1-dev libpcre3-dev zlib1g-dev libssl-dev libxml2-dev libxslt1-dev  libgd-dev google-perftools libgoogle-perftools-dev libperl-dev libgeoip-dev libatomic-ops-dev'
          );
          console.log('install apache2');
          await exec('apt-get -y install apache2');
          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
      if (osName === 'redhat') {
        try {
          config.apache.dir_etc = !_.isNil(config.apache.dir_etc) ? config.apache.dir_etc : '/usr/local/httpd';

          config.apache.dir_conf = !_.isNil(config.apache.dir_conf) ? config.apache.dir_conf : '/usr/local/httpd/conf/extra/web';

          console.log('Install lib... !');
          await exec('yum install -y gcc openssl-devel apr apr-util');
          const aliasName = 'centos';
          const url = `https://github.com/khutran/${aliasName}-httpd/archive/${version}.zip`;
          await App.make(Downloader).download(url, `/tmp/${version}.zip`);
          const dest = path.dirname(`/tmp/${version}.zip`);
          const extral = await decompress(`/tmp/${version}.zip`, dest);

          if (fs.existsSync('/lib/systemd/system/httpd.service')) {
            await rimraf('/lib/systemd/system/httpd.service');
          }

          if (fs.existsSync('/usr/sbin/httpd')) {
            await rimraf('/usr/sbin/httpd');
          }

          if (fs.existsSync(config.apache.dir_etc)) {
            await mv(config.apache.dir_etc, '/tmp/apache_old', { mkdirp: true });
            await mv(`${dest}/${extral[0].path}`, config.apache.dir_etc, { mkdirp: true });
            await rimraf(config.apache.dir_conf);
            await rimraf('/usr/local/apache/conf/httpd.conf');
            await mv('/tmp/apache_old/conf/httpd.conf', `${config.apache.dir_etc}/conf/httpd.conf`, { mkdirp: true });
            await mv('/tmp/apache_old/conf/extra/web', config.apache.dir_conf, { mkdirp: true });
            await rimraf('/tmp/apache_old/');
          } else {
            await mv(`${dest}/${extral[0].path}`, config.apache.dir_etc, { mkdirp: true });
          }
          await mv(`${config.apache.dir_etc}/service/httpd.service`, '/lib/systemd/system/httpd.service', { mkdirp: true });

          if (!fs.existsSync('/usr/sbin/httpd')) {
            fs.symlinkSync(`${config.apache.dir_etc}/bin/httpd`, '/usr/sbin/httpd');
          }

          if (!fs.existsSync('/etc/systemd/system/multi-user.target.wants/httpd.service')) {
            fs.symlinkSync('/lib/systemd/system/httpd.service', '/etc/systemd/system/multi-user.target.wants/httpd.service');
          }

          const passpd = fs.readFileSync('/etc/passwd');
          if (passpd.indexOf('apache') === -1) {
            await exec('useradd -s /sbin/nologin apache');
          }

          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);

          await exec('systemctl daemon-reload');
          await rimraf(`/tmp/${version}.zip`);
          await rimraf(`${dest}/${extral[0].path}`);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
    }
  }
}

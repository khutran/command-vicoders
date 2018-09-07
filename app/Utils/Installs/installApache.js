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
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);
const mv = util.promisify(require('mv'));
// import Darwin from '../Os/Darwin';

export default class installAPache extends Install {
  async service(version) {
    if (this.os === 'darwin') {
      return 'https://www.sylvaindurand.org/setting-up-a-apache-web-server-on-macos/';
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (_.isEmpty(config.apache.dir_home) || !config.apache.dir_home) {
        config.apache.dir_home = '/usr/local/httpd';
      }
      if (_.isEmpty(config.apache.dir_bin) || !config.apache.dir_bin) {
        config.apache.dir_bin = '/usr/local/httpd/bin/httpd';
      }

      if (_.isEmpty(config.apache.dir_systemd) || !config.apache.dir_systemd) {
        config.apache.dir_systemd = '/lib/systemd/system';
      }

      if (osName === 'debian') {
        try {
          console.log('Install lib... !');
          await exec(
            'apt install -y gcc libapr1 libapr1-dev libaprutil1-dev libpcre3-dev zlib1g-dev libssl-dev libxml2-dev libxslt1-dev  libgd-dev google-perftools libgoogle-perftools-dev libperl-dev libgeoip-dev libatomic-ops-dev'
          );
          const aliasName = 'ubuntu';
          const url = `https://github.com/khutran/${aliasName}-httpd/archive/${version}.zip`;
          await App.make(Downloader).download(url, `/tmp/${version}.zip`);
          const dest = path.dirname(`/tmp/${version}.zip`);
          const extral = await decompress(`/tmp/${version}.zip`, dest);

          if (fs.existsSync('/etc/systemd/system/multi-user.target.wants/httpd.service')) {
            await rimraf('/etc/systemd/system/multi-user.target.wants/httpd.service');
          }

          if (fs.existsSync(`${config.apache.dir_systemd}/httpd.service`)) {
            await rimraf(`${config.apache.dir_systemd}/httpd.service`);
          }

          if (fs.existsSync('/usr/sbin/httpd')) {
            await rimraf('/usr/sbin/httpd');
          }

          if (fs.existsSync(config.apache.dir_home)) {
            await mv(config.apache.dir_home, '/tmp/apache_old', { mkdirp: true });
            await mv(`${dest}/${extral[0].path}`, config.apache.dir_home, { mkdirp: true });
            await rimraf(`${config.apache.dir_home}/conf/extra/web`);
            await rimraf(`${config.apache.dir_home}/conf/httpd.conf`);
            await mv('/tmp/apache_old/conf/httpd.conf', `${config.apache.dir_home}/conf/httpd.conf`, { mkdirp: true });
            await mv('/tmp/apache_old/conf/extra/web', `${config.apache.dir_home}/conf/extra/web`, { mkdirp: true });
            await rimraf('/tmp/apache_old/');
          } else {
            await mv(`${dest}/${extral[0].path}`, config.apache.dir_home, { mkdirp: true });
          }

          await mv(`${config.apache.dir_home}/service/httpd.service`, `${config.apache.dir_systemd}/httpd.service`, { mkdirp: true });

          if (!fs.existsSync('/usr/sbin/httpd')) {
            fs.symlinkSync(config.apache.dir_bin, '/usr/sbin/httpd');
          }

          if (!fs.existsSync('/etc/systemd/system/multi-user.target.wants/httpd.service')) {
            fs.symlinkSync(`${config.apache.dir_systemd}/httpd.service`, '/etc/systemd/system/multi-user.target.wants/httpd.service');
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
      if (osName === 'redhat') {
        try {
          console.log('Install lib... !');
          await exec('yum install -y gcc openssl-devel apr apr-util');
          const aliasName = 'centos';
          const url = `https://github.com/khutran/${aliasName}-httpd/archive/${version}.zip`;
          await App.make(Downloader).download(url, `/tmp/${version}.zip`);
          const dest = path.dirname(`/tmp/${version}.zip`);
          const extral = await decompress(`/tmp/${version}.zip`, dest);

          if (fs.existsSync(`${config.apache.dir_systemd}/httpd.service`)) {
            await rimraf(`${config.apache.dir_systemd}/httpd.service`);
          }

          if (fs.existsSync('/usr/sbin/httpd')) {
            await rimraf('/usr/sbin/httpd');
          }

          if (fs.existsSync(config.apache.dir_home)) {
            await mv(config.apache.dir_home, '/tmp/apache_old', { mkdirp: true });
            await mv(`${dest}/${extral[0].path}`, config.apache.dir_home, { mkdirp: true });
            await rimraf('/usr/local/apache/conf/extra/web');
            await rimraf('/usr/local/apache/conf/httpd.conf');
            await mv('/tmp/apache_old/conf/httpd.conf', `${config.apache.dir_home}/conf/httpd.conf`, { mkdirp: true });
            await mv('/tmp/apache_old/conf/extra/web', `${config.apache.dir_home}/conf/extra/web`, { mkdirp: true });
            await rimraf('/tmp/apache_old/');
          } else {
            await mv(`${dest}/${extral[0].path}`, config.apache.dir_home, { mkdirp: true });
          }
          await mv(`${config.apache.dir_home}/service/httpd.service`, `${config.apache.dir_systemd}/httpd.service`, { mkdirp: true });

          if (!fs.existsSync('/usr/sbin/httpd')) {
            fs.symlinkSync(config.apache.dir_bin, '/usr/sbin/httpd');
          }

          if (!fs.existsSync('/etc/systemd/system/multi-user.target.wants/httpd.service')) {
            fs.symlinkSync(`${config.apache.dir_systemd}/httpd.service`, '/etc/systemd/system/multi-user.target.wants/httpd.service');
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

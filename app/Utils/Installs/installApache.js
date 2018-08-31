import Install from './Install';
import decompress from 'decompress';
import path from 'path';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import fs from 'fs';
import { App } from '@nsilly/container';
import { Downloader } from '../Downloader';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);
const mv = util.promisify(require('mv'));
// import Darwin from '../Os/Darwin';

export default class installAPache extends Install {
  async service(version) {
    if (this.os === 'darwin') {
      return 'https://www.sylvaindurand.org/setting-up-a-nginx-web-server-on-macos/';
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        try {
          await exec(
            'apt install -y gcc libapr1 libapr1-dev libaprutil1-dev libpcre3-dev zlib1g-dev libssl-dev libxml2-dev libxslt1-dev  libgd-dev google-perftools libgoogle-perftools-dev libperl-dev libgeoip-dev libatomic-ops-dev'
          );
          const aliasName = 'ubuntu';
          const url = `https://github.com/khutran/${aliasName}-httpd/archive/${version}.zip`;
          await App.make(Downloader).download(url, `/tmp/${version}.zip`);
          const dest = path.dirname(`/tmp/${version}.zip`);
          const extral = await decompress(`/tmp/${version}.zip`, dest);

          if (fs.existsSync('/etc/systemd/system/multi-user.target.wants/nginx.service')) {
            await rimraf('/etc/systemd/system/multi-user.target.wants/nginx.service');
          }

          if (fs.existsSync('/lib/systemd/system/httpd.service')) {
            await rimraf('/lib/systemd/system/httpd.service');
          }

          if (fs.existsSync('/usr/sbin/httpd')) {
            await rimraf('/usr/sbin/httpd');
          }

          await mv('/usr/local/apache/service/httpd.service', '/lib/systemd/system/httpd.service', { mkdirp: true });

          if (fs.existsSync('/usr/local/apache/')) {
            await mv('/usr/local/apache', '/tmp/apache_old', { mkdirp: true });
            await mv(`${dest}/${extral[0].path}`, '/usr/local/apache', { mkdirp: true });
            await rimraf('/usr/local/apache/conf/extra/web');
            await rimraf('/usr/local/apache/conf/httpd.conf');
            await mv('/tmp/apache_old/conf/httpd.conf', '/usr/local/apache/conf/httpd.conf', { mkdirp: true });
            await mv('/tmp/apache_old/conf/extra/web', '/usr/local/apache/conf/extra/web', { mkdirp: true });
            await rimraf('/tmp/apache_old/');
          } else {
            await mv(`${dest}/${extral[0].path}`, '/usr/local/apache', { mkdirp: true });
          }
          if (!fs.existsSync('/usr/sbin/httpd')) {
            fs.symlinkSync('/usr/local/apache/bin/httpd', '/usr/sbin/httpd');
          }

          if (!fs.existsSync('/etc/systemd/system/multi-user.target.wants/httpd.service')) {
            fs.symlinkSync('/lib/systemd/system/httpd.service', '/etc/systemd/system/multi-user.target.wants/httpd.service');
          }

          const passpd = fs.readFileSync('/etc/passwd');
          if (passpd.indexOf('apache') === -1) {
            await exec('useradd -s /sbin/nologin apache');
          }

          // await exec('systemctl daemon-reload');
          await rimraf(`/tmp/${version}.zip`);
          await rimraf(`${dest}/${extral[0].path}`);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
    }
  }
}

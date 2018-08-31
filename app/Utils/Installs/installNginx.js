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

export default class installNginx extends Install {
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
            'apt install -y gcc libpcre3-dev zlib1g-dev libssl-dev libxml2-dev libxslt1-dev  libgd-dev google-perftools libgoogle-perftools-dev libperl-dev libgeoip-dev libatomic-ops-dev'
          );
          const aliasName = 'ubuntu';
          const url = `https://github.com/khutran/${aliasName}-nginx/archive/${version}.zip`;
          const download_nginx = await App.make(Downloader).download(url, `/tmp/${version}.zip`);
          const dest = path.dirname(`/tmp/${version}.zip`);
          const extral = await decompress(`/tmp/${version}.zip`, dest);

          if (fs.existsSync('/usr/local/nginx/')) {
            await rimraf('/usr/local/nginx/');
          }

          if (fs.existsSync('/lib/systemd/system/nginx.service')) {
            await rimraf('/lib/systemd/system/nginx.service');
          }

          if (fs.existsSync('/usr/sbin/nginx')) {
            await rimraf('/usr/sbin/nginx');
          }

          await mv(`${dest}/${extral[0].path}usr-nginx`, '/usr/local/nginx', { mkdirp: true });

          await mv(`${dest}/${extral[0].path}nginx.service`, '/lib/systemd/system/nginx.service', { mkdirp: true });

          if (fs.existsSync('/etc/nginx/')) {
            await mv('/etc/nginx/', '/tmp/nginx_old', { mkdirp: true });
            await mv(`${dest}/${extral[0].path}etc-nginx`, '/etc/nginx', { mkdirp: true });
            await rimraf('/etc/nginx/conf.d/');
            await rimraf('/etc/nginx/nginx.conf');
            await mv('/tmp/nginx_old/conf.d', '/etc/nginx/conf.d', { mkdirp: true });
            await mv('/tmp/nginx_old/nginx.conf', '/etc/nginx/nginx.conf', { mkdirp: true });
            await rimraf('/tmp/nginx_old/');
          } else {
            await mv(`${dest}/${extral[0].path}etc-nginx`, '/etc/nginx', { mkdirp: true });
          }
          if (!fs.existsSync('/usr/sbin/nginx')) {
            fs.symlinkSync('/usr/local/nginx/bin/nginx', '/usr/sbin/nginx');
          }

          if (!fs.existsSync('/etc/systemd/system/multi-user.target.wants/nginx.service')) {
            fs.symlinkSync('/lib/systemd/system/nginx.service', '/etc/systemd/system/multi-user.target.wants/nginx.service');
          }

          const passpd = fs.readFileSync('/etc/passwd');
          if (passpd.indexOf('nginx') === -1) {
            await exec('useradd -s /sbin/nologin nginx');
          }

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

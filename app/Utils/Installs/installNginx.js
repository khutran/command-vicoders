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

export default class installNginx extends Install {
  async service(version) {
    if (this.os === 'darwin') {
      return 'https://www.sylvaindurand.org/setting-up-a-nginx-web-server-on-macos/';
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      // http://sharadchhetri.com/2018/05/15/install-and-compile-nginx-1-14-on-ubuntu-18-04-lts-server/
      if (_.isEmpty(config.nginx.dir_home) || !config.nginx.dir_home) {
        config.nginx.dir_home = '/usr/local/nginx';
      }
      if (_.isEmpty(config.nginx.dir_bin) || !config.nginx.dir_bin) {
        config.nginx.dir_bin = '/usr/local/nginx/bin/nginx';
      }

      if (_.isEmpty(config.nginx.dir_systemd) || !config.nginx.dir_systemd) {
        config.nginx.dir_systemd = '/lib/systemd/system';
      }

      if (_.isEmpty(config.nginx.dir_etc) || !config.nginx.dir_etc) {
        config.nginx.dir_etc = '/etc/nginx';
      }

      if (osName === 'debian') {
        try {
          console.log('Install lib... !');
          await exec(
            'apt install -y gcc libpcre3-dev zlib1g-dev libssl-dev libxml2-dev libxslt1-dev  libgd-dev google-perftools libgoogle-perftools-dev libperl-dev libgeoip-dev libatomic-ops-dev'
          );
          const aliasName = 'ubuntu';
          const url = `https://github.com/khutran/${aliasName}-nginx/archive/${version}.zip`;
          await App.make(Downloader).download(url, `/tmp/${version}.zip`);
          const dest = path.dirname(`/tmp/${version}.zip`);
          const extral = await decompress(`/tmp/${version}.zip`, dest);

          if (fs.existsSync(`${config.nginx.dir_home}`)) {
            await rimraf(`${config.nginx.dir_home}`);
          }

          if (fs.existsSync(`${config.nginx.dir_systemd}/nginx.service`)) {
            await rimraf(`${config.nginx.dir_systemd}/nginx.service`);
          }

          if (fs.existsSync('/usr/sbin/nginx')) {
            await rimraf('/usr/sbin/nginx');
          }

          await mv(`${dest}/${extral[0].path}usr-nginx`, config.nginx.dir_home, { mkdirp: true });

          await mv(`${dest}/${extral[0].path}nginx.service`, `${config.nginx.dir_systemd}/nginx.service`, { mkdirp: true });

          if (fs.existsSync(`${config.nginx.dir_etc}`)) {
            await mv(config.nginx.dir_etc, '/tmp/nginx_old', { mkdirp: true });
            await mv(`${dest}/${extral[0].path}etc-nginx`, config.nginx.dir_etc, { mkdirp: true });
            await rimraf(`${config.nginx.dir_etc}/conf.d/`);
            await rimraf(`${config.nginx.dir_etc}/nginx.conf`);
            await mv('/tmp/nginx_old/conf.d', `${config.nginx.dir_etc}/conf.d`, { mkdirp: true });
            await mv('/tmp/nginx_old/nginx.conf', `${config.nginx.dir_etc}/nginx.conf`, { mkdirp: true });
            await rimraf('/tmp/nginx_old/');
          } else {
            await mv(`${dest}/${extral[0].path}etc-nginx`, config.nginx.dir_etc, { mkdirp: true });
          }
          if (!fs.existsSync('/usr/sbin/nginx')) {
            fs.symlinkSync(`${config.nginx.dir_bin}`, '/usr/sbin/nginx');
          }

          if (!fs.existsSync('/etc/systemd/system/multi-user.target.wants/nginx.service')) {
            fs.symlinkSync(`${config.nginx.dir_systemd}/nginx.service`, '/etc/systemd/system/multi-user.target.wants/nginx.service');
          }

          const passpd = fs.readFileSync('/etc/passwd');
          if (passpd.indexOf('nginx') === -1) {
            await exec('useradd -s /sbin/nologin nginx');
          }

          if (!fs.existsSync('/var/log/nginx')) {
            fs.mkdirSync('/var/log/nginx');
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
          console.log(config.nginx);
          // console.log('Install lib... !');
          // await exec('yum install -y gcc openssl-devel apr apr-util');
          // await exec('yum install -y epel-release');
          // await exec('yum install -y nginx');
          // const aliasName = 'centos';
          // const url = `https://github.com/khutran/${aliasName}-nginx/archive/master.zip`;
          // await App.make(Downloader).download(url, `/tmp/master.zip`);
          // const dest = path.dirname(`/tmp/master.zip`);
          // const extral = await decompress(`/tmp/master.zip`, dest);
          // await mv(`${dest}/${extral[0].path}nginx.conf`, config.nginx.dir_home, { mkdirp: true });
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
    }
  }
}

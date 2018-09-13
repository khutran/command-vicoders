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
          console.log('Install lib... !');
          await exec(
            'apt install -y gcc libpcre3-dev zlib1g-dev libssl-dev libxml2-dev libxslt1-dev  libgd-dev google-perftools libgoogle-perftools-dev libperl-dev libgeoip-dev libatomic-ops-dev'
          );
          await exec('apt -y update');
          await exec('apt install -y nginx');
          const url = `https://github.com/khutran/nginx/archive/master.zip`;
          await App.make(Downloader).download(url, '/tmp/master.zip');
          const dest = path.dirname('/tmp/master.zip');
          const extral = await decompress('/tmp/master.zip', dest);
          await rimraf(`${config.nginx.dir_etc}/nginx.conf`);
          await mv(`${dest}/${extral[0].path}nginx.conf`, `${config.nginx.dir_etc}/nginx.conf`);
          if (!fs.existsSync(`${config.nginx.dir_etc}/conf.d/ssl`)) {
            await mv(`${dest}/${extral[0].path}ssl`, `${config.nginx.dir_etc}/conf.d/ssl`);
          }
          await rimraf('/tmp/master.zip');
          await rimraf(`${dest}/${extral[0].path}`);
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
          console.log('Install lib... !');
          await exec('yum install -y gcc openssl-devel apr apr-util');
          await exec('yum install -y epel-release');
          await exec('yum install -y nginx');
          const url = `https://github.com/khutran/nginx/archive/master.zip`;
          await App.make(Downloader).download(url, '/tmp/master.zip');
          const dest = path.dirname('/tmp/master.zip');
          const extral = await decompress('/tmp/master.zip', dest);
          await rimraf(`${config.nginx.dir_etc}/nginx.conf`);
          await mv(`${dest}/${extral[0].path}nginx.conf`, `${config.nginx.dir_etc}/nginx.conf`);
          if (!fs.existsSync(`${config.nginx.dir_etc}/conf.d/ssl`)) {
            await mv(`${dest}/${extral[0].path}ssl`, `${config.nginx.dir_etc}/conf.d/ssl`);
          }
          await rimraf('/tmp/master.zip');
          await rimraf(`${dest}/${extral[0].path}`);
          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
    }
  }
}

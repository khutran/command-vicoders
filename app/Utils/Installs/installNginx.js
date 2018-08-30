import Install from './Install';
import { Download } from '../Download';
import decompress from 'decompress';
import path from 'path';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import fs from 'fs';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);
const mv = util.promisify(require('mv'));
// import Darwin from '../Os/Darwin';

export default class installNginx extends Install {
  async service(version) {
    if (this.os === 'darwin') {
      console.log('test');
      // try {
      //   const url = 'https://github.com/khutran/ubuntu-nginx/archive/1.13.8.zip';
      //   const download = new Download();
      //   const download_nginx = await download.form(url).to('/tmp');
      //   const dest = path.dirname(download_nginx.filepath);
      //   const extral = await decompress(download_nginx.filepath, dest);
      //   mv(`${dest}/${extral[0].path}usr-nginx`, '/usr/local/nginx', { mkdirp: true }, err => {
      //     if (err) {
      //       throw new Exception(err.message, 1);
      //     }
      //   });
      //   mv(`${dest}/${extral[0].path}etc-nginx`, '/etc/nginx', { mkdirp: true }, err => {
      //     if (err) {
      //       throw new Exception(err.message, 1);
      //     }
      //   });
      //   mv(`${dest}/${extral[0].path}nginx.service`, '/lib/systemd/system//nginx.service', { mkdirp: true }, err => {
      //     if (err) {
      //       throw new Exception(err.message, 1);
      //     }
      //   });
      //   await rimraf(download_nginx.filepath);
      //   await rimraf(`${dest}/${extral[0].path}`);
      // } catch (e) {
      //   throw new Exception(e.message, 1);
      // }
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        try {
          const aliasName = 'ubuntu';
          const url = `https://github.com/khutran/${aliasName}-nginx/archive/${version}.zip`;
          const download = new Download();
          const download_nginx = await download.form(url).to('/tmp');
          const dest = path.dirname(download_nginx.filepath);
          const extral = await decompress(download_nginx.filepath, dest);

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

          if (!fs.existsSync('/etc/systemd/system/nginx.service')) {
            fs.symlinkSync('/lib/systemd/system/nginx.service', '/etc/systemd/system/nginx.service');
          }

          if (parseInt(await exec("grep -c '^nginx:' /etc/passwd")) === 0) {
            await exec('useradd -s /sbin/nologin nginx');
          }

          await exec('systemctl daemon-reload');
          await rimraf(download_nginx.filepath);
          await rimraf(`${dest}/${extral[0].path}`);
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
    }
  }
}

import Install from './Install';
import Linux from '../Os/Linux';
import { Downloader } from '../Downloader';
import fs from 'fs';
import { App } from '@nsilly/container';
import path from 'path';
import colors from 'colors';
import { dd } from 'dumper.js';
import decompress from 'decompress';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const mv = util.promisify(require('mv'));

export default class installMysql extends Install {
  async service() {
    if (this.os === 'darwin') {
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        if (!(await linux.CheckExists('mysql')) && !fs.existsSync('/var/lib/mysql')) {
          const url = 'https://github.com/khutran/mysql/archive/ubuntu.zip';
          const dest = path.dirname('/tmp/ubuntu.zip');
          await App.make(Downloader).download(url, '/tmp/ubuntu.zip');
          const extral = await decompress(`/tmp/ubuntu.zip`, dest);
          await mv(`${dest}/${extral[0].path}`, '/var/lib/mysql', { mkdirp: true });
          await rimraf('/tmp/ubuntu.zip');
          await rimraf(`${dest}/${extral[0].path}`);
        } else if ((await linux.CheckExists('mysql')) && fs.existsSync('/var/lib/mysql')) {
          dd(colors.green('your computer installed mysql - run "apt install mysql-server"'));
        }
      }
      if (osName === 'redhat') {
      }
    }
  }
}

import Install from './Install';
import Linux from '../Os/Linux';
import { Downloader } from '../Downloader';
// import inquirer from 'inquirer';
import fs from 'fs';
import { App } from '@nsilly/container';
import path from 'path';

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
          const dest = path.dirname(`/tmp/ubuntu.zip`);
          await App.make(Downloader).download(url, dest);
        }
      }
      if (osName === 'redhat') {
      }
    }
  }
}

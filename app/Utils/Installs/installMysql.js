import Install from './Install';
import Linux from '../Os/Linux';
import fs from 'fs';
import colors from 'colors';
import { dd } from 'dumper.js';
import { exec } from 'child-process-promise';

export default class installMysql extends Install {
  async service() {
    if (this.os === 'darwin') {
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        if (!fs.existsSync('/var/lib/mysql')) {
          await exec('apt-get -y update');
          await exec('apt-get install -y mysql-server');
          await exec('/etc/init.d/mysql start');
          await exec('mysql_secure_installation');
        } else if ((await linux.CheckExists('mysql')) && fs.existsSync('/var/lib/mysql')) {
          dd(colors.green('your computer installed mysql - run "apt install mysql-server"'));
        }
      }
      if (osName === 'redhat') {
      }
    }
  }
}

import Install from './Install';
import Linux from '../Os/Linux';
import colors from 'colors';
import { dd } from 'dumper.js';

export default class installMysql extends Install {
  async service() {
    if (this.os === 'win32') {
      return new Promise(async resolve => {
        resolve({ message: 'tool not support install mysql in windown !', code: 0 });
      });
    }
    if (this.os === 'darwin') {
      return new Promise(async resolve => {
        resolve({ message: 'tool not support install mysql in mac !', code: 0 });
      });
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        console.log(colors.green('apt -y update'));
        console.log(colors.green('apt install mysql-server'));
        console.log(colors.green('mysql_secure_installation'));
      }
      if (osName === 'redhat') {
        dd(colors.green('yum install -y mysql-server'));
      }
    }
  }
}

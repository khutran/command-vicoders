import Install from './Install';
import Linux from '../Os/Linux';
import colors from 'colors';
import { dd } from 'dumper.js';

export default class installMysql extends Install {
  async service() {
    if (this.os === 'darwin') {
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        dd(colors.green('apt install mysql-server'));
      }
      if (osName === 'redhat') {
        dd(colors.green('yum install -y mysql-server'));
      }
    }
  }
}

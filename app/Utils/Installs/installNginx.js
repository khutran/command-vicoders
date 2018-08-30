import Install from './Install';
import { Download } from '../Download';
import Linux from '../Os/Linux';

export default class installNginx extends Install {
  async service() {
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        const url = 'https://github.com/khutran/ubuntu-nginx/archive/1.13.8.zip';
        const download = new Download();
        const download_nginx = await download.form(url);
        console.log(download_nginx);
      }
    }
  }
}

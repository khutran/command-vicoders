import Install from './Install';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import of from 'await-of';
import { exec } from 'child-process-promise';

export default class installPhp extends Install {
  async service(version) {
    if (this.os === 'darwin') {
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        console.log('Enable PPA');
        await exec('apt-get install -y software-properties-common');

        await of(exec('add-apt-repository -y ppa:ondrej/php'));
        console.log('update ... !');
        await exec('apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 4F4EA0AAE5267A6C');
        await exec('apt -y update');
        await exec('apt list --upgradable');

        console.log(`Install php ${version}`);
        await exec(`apt-get install -y php${version}-fpm`);
        await exec(`apt-get install -y php${version}`);
        await exec(`apt-get install -y php7.2-curl php7.2-json php7.2-mbstring php7.2-gd php7.2-intl php7.2-xml php7.2-imagick php7.2-redis php7.2-zip`);
      }
      if (osName === 'redhat') {
        try {
        } catch (e) {
          throw new Exception(e.message, 1);
        }
      }
    }
  }
}

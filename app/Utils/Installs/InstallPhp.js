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
        await exec(
          `apt-get install -y php${version}-curl php${version}-json php${version}-mbstring php${version}-gd php${version}-intl php${version}-xml php${version}-imagick php${version}-redis php${version}-zip`
        );
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

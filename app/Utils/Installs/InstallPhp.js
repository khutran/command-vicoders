import Install from './Install';
import Linux from '../Os/Linux';
import of from 'await-of';
import { exec } from 'child-process-promise';
import { dd } from 'dumper.js';
import _ from 'lodash';
import fs from 'fs';
import config from '../../config/config.json';

const util = require('util');
const rimraf = util.promisify(require('rimraf'));

export default class installPhp extends Install {
  async service(version) {
    if (this.os === 'darwin') {
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        try {
          console.log('Enable PPA');
          await exec('apt-get install -y software-properties-common');

          await of(exec('add-apt-repository -y ppa:ondrej/php'));
          console.log('update ... !');
          await exec('apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 4F4EA0AAE5267A6C');
          await exec('apt-get -y update');
          await exec('apt list --upgradable');

          console.log(`Install php ${version}`);
          await exec(`apt-get install -y php${version}-fpm`);
          await exec(`apt-get install -y php${version}`);
          await exec(
            `apt-get install -y php${version}-curl php${version}-mysql php${version}-json php${version}-mbstring php${version}-gd php${version}-intl php${version}-xml php${version}-imagick php${version}-redis php${version}-zip`
          );

          config.connectPhp = await linux.getPhpSock();
          await exec(`php${version}-fpm`);
          config.connectPhp = await linux.getPhpSock();

          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        } catch (e) {
          dd(e.message);
        }
      }
      if (osName === 'redhat') {
        try {
          version = _.replace(version, '.', '');
          console.log('instal repo ... !');
          await exec('yum install -y epel-release');
          await of(exec('rpm -Uvh https://mirror.webtatic.com/yum/el7/webtatic-release.rpm'));
          console.log(`install php ${version}`);
          await exec(
            `yum install -y php${version}w-curl php${version}w-devel php${version}w-mysql php${version}w-json php${version}w-mbstring php${version}w-gd php${version}w-intl php${version}w-xml php${version}w-pecl-imagick php${version}w-redis php${version}w-zip`
          );
          await exec(`yum install -y php${version}w-fpm`);

          config.connectPhp = await linux.getPhpSock();
          await exec(`php${version}-fpm`);
          config.connectPhp = await linux.getPhpSock();
          const data = JSON.stringify(config, null, 2);
          fs.writeFileSync(`${__dirname}/../../config/config.json`, data);
        } catch (e) {
          dd(e.message);
        }
      }
    }
  }
}

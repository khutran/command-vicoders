import Install from './Install';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import fs from 'fs';
import _ from 'lodash';
import of from 'await-of';
import { spawn } from 'child-process-promise';
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { dd } = require('dumper');

export default class installPhp extends Install {
  async service(version) {
    if (this.os === 'darwin') {
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        dd('Enable PPA');
        const [, err] = await of(exec('apt-get install -y software-properties-common'));

        if (err) {
          dd(err);
        }

        const [, err2] = await of(exec('add-apt-repository -y ppa:ondrej/php'));
        if (err2) {
          dd(err2);
        }

        dd('update .... !');
        await of(exec('apt -y update'));

        dd(`Install php ${version}`);
        await exec(
          `apt-get install -y php${version} php${version}-cli php${version}-common php${version}-json  php${version}-mysql php${version}-mbstring php${version}-mcrypt php${version}-zip php${version}-fpm`
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

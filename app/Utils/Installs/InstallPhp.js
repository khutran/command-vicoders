import Install from './Install';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import fs from 'fs';
import _ from 'lodash';
import of from 'await-of';
import { spawn } from 'child-process-promise';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class installPhp extends Install {
  async service(version) {
    if (this.os === 'darwin') {
    }
    if (this.os === 'linux') {
      const linux = new Linux();
      const osName = linux.osName();
      if (osName === 'debian') {
        console.log('Enable PPA');
        const [, err] = await of(exec('apt-get install -y software-properties-common'));

        if (err) {
          console.log(err);
        }

        const [, err2] = await of(spawn('add-apt-repository', ['ppa:ondrej/php'], { capture: ['stdout'] }));
        if (err2) {
          console.log(err2);
        }
        process.stdin.on('data', key => {
          console.log(key);
        });
        // await spawn('add-apt-repository', ['ppa:ondrej/php'], {
        //   capture: ['stdout']
        // }).progress(childProcess => {
        //   process.stdin.on('data', key => {
        //     console.log(key);
        //   });
        // childProcess.stdin.write('\n');
        // childProcess.stdin.end();
        // });

        console.log('update .... !');
        await exec('apt -y update');
        // console.log(`Install php ${version}`);
        // await exec(
        //   `apt-get install -y php${version} php${version}-cli php${version}-common php${version}-json php${version}-opcache php${version}-mysql php${version}-mbstring php${version}-mcrypt php${version}-zip php${version}-fpm`
        // );
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

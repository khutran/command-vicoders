import Install from './Install';
import path from 'path';
import { Exception } from '@nsilly/exceptions/dist/src/Exceptions/Exception';
import Linux from '../Os/Linux';
import fs from 'fs';
import { App } from '@nsilly/container';
import { Downloader } from '../Downloader';
import config from '../../config/config.json';
import _ from 'lodash';
import { spawn } from 'child-process-promise';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);
const mv = util.promisify(require('mv'));
// import Darwin from '../Os/Darwin';

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

          const add = await spawn('add-apt-repository', ['ppa:ondrej/php'], {
            capture: ['stdout']
          }).progress(childProcess => {
            console.log('test');
            childProcess.stdin.write('\n');
            childProcess.stdin.end();
          });
          console.log('update .... !');
          // await exec('apt -y update');
          console.log(add);
          // console.log(`Install php ${version}`);
          // await exec(
          //   `apt-get install -y php${version} php${version}-cli php${version}-common php${version}-json php${version}-opcache php${version}-mysql php${version}-mbstring php${version}-mcrypt php${version}-zip php${version}-fpm`
          // );
        } catch (e) {
          throw new Exception(e.message, 1);
        }
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

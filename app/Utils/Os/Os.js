import fs from 'fs';
import os from 'os';
import * as _ from 'lodash';
import { exec } from 'child-process-promise';

// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
// const readFile = util.promisify(fs.readFile);

export default class Os {
  osName() {
    let osName;
    if (fs.existsSync('/etc/redhat-release')) {
      osName = 'redhat';
    }
    if (fs.existsSync('/etc/lsb-release')) {
      osName = 'debian';
    }
    return osName;
  }
  userInfo() {
    return os.userInfo();
  }
  platform() {
    return os.platform();
  }

  tmpDir() {
    return os.tmpdir();
  }

  async CheckExists(name) {
    return new Promise(async resolve => {
      try {
        await exec(`which ${name}`);
        resolve(true);
      } catch (e) {
        resolve(false);
      }
    });
  }

  async getPhpSock() {
    let path_sock;
    const forder = ['/var/run/php', '/var/run/php-fpm'];
    if (await this.CheckExists('php')) {
      _.forEach(forder, item => {
        if (!fs.existsSync(item)) {
          fs.mkdirSync(item);
        }
        fs.readdirSync(item).filter(sock => {
          if (sock.includes('php') && sock.includes('sock')) {
            path_sock = `unix:${item}/${sock}`;
          }
        });
      });
    }
    return path_sock;
  }
}

import fs from 'fs';
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
  osVersion() {}
}

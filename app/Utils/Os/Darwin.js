import Os from './Os';
import * as _ from 'lodash';
import fs from 'fs';

export default class Darwin extends Os {
  CheckExists(name) {
    return new Promise(resolve => {
      const folder = [`/usr/local/bin/${name}`, `/usr/bin/${name}`, `/usr/sbin/${name}`, `/usr/local/sbin/${name}`, `/bin/${name}`];
      let result = false;
      _.forEach(folder, item => {
        if (fs.existsSync(item)) {
          result = true;
        }
      });
      resolve(result);
    });
  }
}

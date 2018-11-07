import { exec } from 'child_process';
import _ from 'lodash';

export class AngularResourceComponent {
  constructor() {
    this.availabel_options = ['name', 'type', 'api', 'apifolderpath', 'model', 'component'];
  }
  setOption(option, value) {
    this[option] = value;
    return this;
  }

  exec() {
    return new Promise((resolve, reject) => {
      const options = [];
      _.forEach(this.availabel_options, opt => {
        if (!_.isNil(this[opt])) {
          options.push(`--${opt}="${this[opt]}"`);
        }
      });
      const command = `./node_modules/.bin/ng generate @vicoders/vc-component:vrc ${options.join(' ')}`;
      console.log(`\n${command}\n`);

      exec(command, (error, stdout) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      });
    });
  }
}

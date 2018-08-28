import fs from 'fs';
// import { Exception } from 'handlebars';
import Os from './Os';

export default class Darwin extends Os {
  CheckExists(name) {
    if (fs.existsSync(`/usr/local/bin/${name}`)) {
      return true;
    }
    return false;
  }
}

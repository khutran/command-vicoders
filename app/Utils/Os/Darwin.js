import fs from 'fs';
import { Exception } from 'handlebars';
import Os from './Os';

export class Darwin extends Os {
  CheckExists(name) {
    try {
      if (fs.existsSync(`/usr/local/bin/${name}`)) {
        return true;
      }
      return false;
    } catch (e) {
      throw new Exception('e.message', 1);
    }
  }
}

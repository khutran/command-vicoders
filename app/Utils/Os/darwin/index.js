import fs from 'fs';
import { Exception } from 'handlebars';

export class Darwin {
  package(name) {
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

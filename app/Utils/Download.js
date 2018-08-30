import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';

export class Download {
  constructor() {
    this.down;
  }
  form(url) {
    this.down = {
      method: 'GET',
      url: url,
      responseType: 'stream'
    };
    return this;
  }
  to(forder = '.') {
    return new Promise(async (resolve, reject) => {
      const f = _.split(this.down.url, '/');
      const file = _.takeRight(f).toString();
      const filepath = path.resolve(process.cwd(), `${forder}/${file}`);
      const response = await axios(this.down);
      response.data.pipe(fs.createWriteStream(filepath));

      var len = parseInt(response.data.headers['content-length'], 10);
      var cur = 0;
      var total = len / 1048576;

      process.stdout.write('Downloading ...');
      response.data.on('data', function(chunk) {
        cur += chunk.length;
        const percent = ((100.0 * cur) / len).toFixed(2);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Downloading ${percent}% of ${total.toFixed(2)}MB`);
      });

      response.data.on('end', () => {
        process.stdout.clearLine();
        resolve({ filename: file, filepath });
      });
      response.data.on('error', () => {
        reject(new Error('Can not download file'));
      });
    });
  }
}

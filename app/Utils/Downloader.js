import axios from 'axios';
import fs from 'fs';

export class Downloader {
  /**
   *
   * @param String url
   * @param String destination file
   * @param Object axios options
   */
  async download(url, dest, options) {
    if (options !== undefined) {
      options = Object.assign({ method: 'GET', responseType: 'stream' }, options, { url });
    } else {
      options = { method: 'GET', responseType: 'stream', url: url };
    }

    const response = await axios(options);

    response.data.pipe(fs.createWriteStream(dest));
    return new Promise((resolve, reject) => {
      const len = parseInt(response.data.headers['content-length'], 10);
      let cur = 0;
      const total = len / 1000;
      process.stdout.write('Downloading ...');

      response.data.on('data', function(chunk) {
        cur += chunk.length;
        const percent = (cur / len).toFixed(2);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Downloading ${percent}% of ${total.toFixed(2)}MB`);
      });

      response.data.on('end', () => {
        process.stdout.clearLine();
        resolve();
      });

      response.data.on('error', () => {
        reject(new Error('Can not download file'));
      });
    });
  }
}

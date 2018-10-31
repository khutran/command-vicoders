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
      const len = Number(response.data.headers['content-length']);
      let cur = 0;
      const total = Number(len) / 1048576;
      if (process !== undefined && process.stdout !== undefined) {
        process.stdout.write('Downloading ...\n');
      }

      response.data.on('data', function(chunk) {
        if (process !== undefined && process.stdout !== undefined) {
          cur += Number(chunk.length);
          const percent = ((100.0 * cur) / len).toFixed(2);
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          if (total > 0) {
            process.stdout.write(`Downloading ${percent}% of ${total.toFixed(2)}MB`);
          }
        } else {
          console.log('Downloading...');
        }
      });

      response.data.on('end', () => {
        if (process !== undefined && process.stdout !== undefined) {
          process.stdout.clearLine();
          process.stdout.write('\n');
        }
        resolve();
      });

      response.data.on('error', () => {
        reject(new Error('Can not download file'));
      });
    });
  }
}

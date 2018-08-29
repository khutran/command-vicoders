import { Command } from './Command';
import axios from 'axios';
import path from 'path';
import decompress from 'decompress';
import fs from 'fs';
import mv from 'mv';
import rimraf from 'rimraf';
import { Download } from '../../Utils/Download';

export default class CreateProjectCommand extends Command {
  signature() {
    return 'create-project <type>';
  }

  description() {
    return 'Software Development Kit for Vicoders';
  }

  options() {
    return [{ key: 'name', description: 'The application name' }];
  }

  async handle(type, options) {
    // const zip_file_name = Date.now().toString();
    switch (type) {
      case 'angular-admin':
        const url = 'http://bitbucket.org/vicoderscom/vc_kit_angular_cli_v6/get/master.zip';
        const download = new Download();
        const test = await download.form(url).to('test.vicoders.com');
        console.log(test);
      // const filepath = path.resolve(process.cwd(), `${zip_file_name}.zip`);
      // const file = fs.createWriteStream(filepath);
      // const response = await axios({
      //   method: 'GET',
      //   url: url,
      //   responseType: 'stream'
      // });

      // response.data.pipe(file);

      // return new Promise((resolve, reject) => {
      //   var len = parseInt(response.data.headers['content-length'], 10);
      //   var cur = 0;
      //   var total = len / 1048576;

      //   process.stdout.write('Downloading ...');
      //   response.data.on('data', function(chunk) {
      //     cur += chunk.length;
      //     const percent = ((100.0 * cur) / len).toFixed(2);
      //     process.stdout.clearLine();
      //     process.stdout.cursorTo(0);
      //     process.stdout.write(`Downloading ${percent}% of ${total.toFixed(2)}MB`);
      //   });

      //   response.data.on('end', () => {
      //     process.stdout.clearLine();
      //     resolve({ filename: zip_file_name, filepath });
      //   });
      //   response.data.on('error', () => {
      //     reject(new Error('Can not download file'));
      //   });
      // })
      //   .then(function(data) {
      //     return new Promise((resolve, reject) => {
      //       const dest = path.resolve(process.cwd(), data.filename);

      //       decompress(data.filepath, dest)
      //         .then(() => {
      //           rimraf.sync(data.filepath);
      //           resolve(dest);
      //         })
      //         .catch(error => {
      //           reject(error);
      //         });
      //     });
      //   })
      //   .then(function(dest) {
      //     let name = 'angular-admin';
      //     if (typeof options.name === 'string' && options.name !== '') {
      //       name = options.name;
      //     }
      //     const files = fs.readdirSync(dest);
      //     mv(`${dest}/${files[0]}`, path.resolve(process.cwd(), name), () => {});
      //     rimraf.sync(dest);
      //   });

      default:
        break;
    }
    process.exit();
  }
}

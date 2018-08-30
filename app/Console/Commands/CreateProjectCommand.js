import { Command } from './Command';
import { Downloader } from '../../Utils/Downloader';
import { App } from '@nsilly/container';
import path from 'path';
import rimraf from 'rimraf';
import decompress from 'decompress';
import mv from 'mv';
import fs from 'fs';

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
        const filename = Date.now().toString();
        const dest = path.resolve(process.cwd(), filename + '.zip');
        await App.make(Downloader).download(url, dest);

        return new Promise((resolve, reject) => {
          decompress(dest, path.resolve(process.cwd(), filename))
            .then(() => {
              rimraf.sync(dest);
              resolve();
            })
            .catch(error => {
              reject(error);
            });
        }).then(function() {
          let name = 'angular-admin';
          if (typeof options.name === 'string' && options.name !== '') {
            name = options.name;
          }
          const folder = path.resolve(process.cwd(), filename);
          const files = fs.readdirSync(folder);
          mv(`${folder}/${files[0]}`, path.resolve(process.cwd(), name), () => {});
          rimraf.sync(folder);
        });

      default:
        break;
    }
    process.exit();
  }
}

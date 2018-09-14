import { Command } from './Command';
import { Downloader } from '../../Utils/Downloader';
import { App } from '@nsilly/container';
import path from 'path';
import rimraf from 'rimraf';
import mv from 'mv';
import fs from 'fs';
import readline from 'readline';
import { Decompresser } from '../../Utils/Decompresser';
import { Exception } from '@nsilly/exceptions';

const createFromUrl = async function(url, name) {
  const filename = Date.now().toString();
  const dest = path.resolve(process.cwd(), filename + '.zip');
  await App.make(Downloader).download(url, dest);
  await App.make(Decompresser).decompress(dest, path.resolve(process.cwd(), filename));
  rimraf.sync(dest);
  const folder = path.resolve(process.cwd(), filename);
  const files = fs.readdirSync(folder);
  mv(`${folder}/${files[0]}`, path.resolve(process.cwd(), name), () => {});
  rimraf.sync(folder);
};

export default class CreateProjectCommand extends Command {
  signature() {
    return 'create-project';
  }

  description() {
    return 'Software Development Kit for Vicoders';
  }

  options() {
    return [{ key: 'name', description: 'The application name' }];
  }

  async handle(options) {
    const supported_kits = [
      {
        url: 'http://bitbucket.org/vicoderscom/vc_kit_angular_cli_v6/get/master.zip',
        name: 'angular-admin',
        description: 'Create an angular admin'
      },
      {
        url: 'https://bitbucket.org/vicoderscom/vc_kit_html_css_javascript/get/master.zip',
        name: 'kit-html-css',
        description: 'Create a kit for HTML/CSS/JS project'
      },
      {
        url: 'https://bitbucket.org/hieu_pv/vc_kit_javascript_module/get/master.zip',
        name: 'kit-javascript',
        description: 'Create a kit for javascript module development'
      },
      {
        url: 'https://github.com/codersvn/kit_nodejs/archive/master.zip',
        name: 'kit-nodejs',
        description: 'Create a kit for nodejs module development'
      },
      {
        url: 'https://github.com/codersvn/kit-tsx/archive/master.zip',
        name: 'kit-tsx',
        description: 'Create a kit for react library development'
      }
    ];
    return new Promise(async function(resolve, reject) {
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        let message = 'Select your kit that you want \n';
        supported_kits.forEach((item, key) => {
          message += `\n ${key + 1}. ${item.description}`;
        });
        message += '\n \n Kit Number: ';
        rl.question(message, async function(answer) {
          rl.close();
          const index = Number(answer) - 1;
          if (index > supported_kits.length) {
            throw new Exception('Please select your project that you want to start', 1);
          }
          let name = supported_kits[index].name;
          if (typeof options.name === 'string' && options.name !== '') {
            name = options.name;
          }
          await createFromUrl(supported_kits[index].url, name);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

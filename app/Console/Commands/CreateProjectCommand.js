import { Command } from './Command';
import { Downloader } from '../../Utils/Downloader';
import { App } from '@nsilly/container';
import path from 'path';
import rimraf from 'rimraf';
import mv from 'mv';
import fs from 'fs';
import { Decompresser } from '../../Utils/Decompresser';

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
    const createFromUrl = async function(url, name) {
      const filename = Date.now().toString();
      const dest = path.resolve(process.cwd(), filename + '.zip');
      await App.make(Downloader).download(url, dest);
      await App.make(Decompresser).decompress(dest, path.resolve(process.cwd(), filename));
      rimraf.sync(dest);
      if (typeof options.name === 'string' && options.name !== '') {
        name = options.name;
      }
      const folder = path.resolve(process.cwd(), filename);
      const files = fs.readdirSync(folder);
      mv(`${folder}/${files[0]}`, path.resolve(process.cwd(), name), () => {});
      rimraf.sync(folder);
    };
    switch (type) {
      case 'angular-admin':
        await createFromUrl('http://bitbucket.org/vicoderscom/vc_kit_angular_cli_v6/get/master.zip', 'angular-admin');
        break;
      case 'kit-html-css':
        await createFromUrl('https://bitbucket.org/vicoderscom/vc_kit_html_css_javascript/get/master.zip', 'kit-html-css');
        break;
      case 'kit-javascript':
        await createFromUrl('https://bitbucket.org/hieu_pv/vc_kit_javascript_module/get/master.zip', 'kit-javascript');
        break;
      default:
        break;
    }
    process.exit();
  }
}

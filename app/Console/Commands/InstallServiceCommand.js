import { Command } from './Command';
import _ from 'lodash';
import colors from 'colors';
import InstallVscode from '../../Utils/Installs/InstallVscode';
import InstallSubl from '../../Utils/Installs/installSubl';
import installNginx from '../../Utils/Installs/installNginx';

export default class VscodeCommand extends Command {
  signature() {
    return 'install <<service>>';
  }

  description() {
    return ['Install - Manager Editer of computer'];
  }

  options() {
    return [{ key: 'install-extentions', description: 'install extention [vscode, subl]' }, { key: 'versions', description: 'version service' }];
  }

  async handle(service, option) {
    const data = {
      version: option.versions,
      installExtentions: option.installExtentions
    };

    switch (service) {
      case 'vscode':
        try {
          const install = new InstallVscode();
          await install.service();
          if (!_.isUndefined(data.installExtentions)) {
            await install.extentions();
          }
        } catch (e) {
          console.log(colors.red(e.message));
        }
        break;
      case 'subl':
        try {
          const install = new InstallSubl();
          const i = await install.service();
          console.log(i);
          if (!_.isUndefined(data.installExtentions)) {
            await install.extentions();
          }
        } catch (e) {
          console.log(colors.red(e.message));
        }
        break;
      case 'nginx':
        try {
          let version = '1.13.8';
          if (!_.isUndefined(data.version)) {
            version = data.version;
          }
          const install = new installNginx();
          const result = await install.service(version);
          console.log(colors.green(result));
        } catch (e) {
          console.log(colors.red(e.message));
        }
        break;
      default:
        break;
    }
  }
}

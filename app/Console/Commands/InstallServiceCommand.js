import { Command } from './Command';
import _ from 'lodash';
import colors from 'colors';
import InstallVscode from '../../Utils/Installs/InstallVscode';
import InstallSubl from '../../Utils/Installs/installSubl';
import installNginx from '../../Utils/Installs/installNginx';
import installAPache from '../../Utils/Installs/installApache';

export default class VscodeCommand extends Command {
  signature() {
    return 'install <service>';
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
          const result = await install.service();
          if (result.code === 1) {
            console.log(colors.green(result.message));
          }
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
          const result = await install.service();
          if (result.code === 1) {
            console.log(colors.green(result.message));
          }
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
          await install.service(version);
          console.log(colors.green('success .. !'));
        } catch (e) {
          console.log(colors.red(e.message));
        }
        break;
      case 'apache':
        try {
          let version = '2.4.34';
          if (!_.isUndefined(data.version)) {
            version = data.version;
          }
          const install = new installAPache();
          await install.service(version);
          console.log(colors.green('success .. !'));
        } catch (e) {
          console.log(colors.red(e.message));
        }
        break;
      default:
        break;
    }
  }
}

import { Command } from './Command';
import _ from 'lodash';
import colors from 'colors';
import InstallVscode from '../../Utils/Installs/InstallVscode';
import InstallSubl from '../../Utils/Installs/installSubl';
import installNginx from '../../Utils/Installs/installNginx';

export default class VscodeCommand extends Command {
  signature() {
    return 'install';
  }

  description() {
    return ['Install - Manager Editer of computer'];
  }

  options() {
    return [
      { key: 'service', description: 'service name [code , subl , nginx ]' },
      { key: 'install-extentions', description: 'install extention [vscode, subl]' },
      { key: 'version', description: 'version service' }
    ];
  }

  async handle(option) {
    const data = {
      service: option.service,
      version: option.version,
      installExtentions: option.installExtentions
    };
    for (const i in data) {
      if (_.isUndefined(data[i])) {
        delete data[i];
      }
    }
    _.mapKeys(data, async (value, key) => {
      if (key === 'service') {
        switch (value) {
          case 'vscode':
            try {
              const install = new InstallVscode();
              await install.service();
            } catch (e) {
              console.log(colors.red(e.message));
            }
            break;
          case 'subl':
            try {
              const install = new InstallSubl();
              await install.service();
            } catch (e) {
              console.log(colors.red(e.message));
            }
            break;
          case 'nginx':
            try {
              const install = new installNginx();
              await install.service(data.version);
            } catch (e) {
              console.log(colors.red(e.message));
            }
            break;
          default:
            break;
        }
      }
      if (key === 'installExtentions') {
        switch (value) {
          case 'vscode':
            try {
              const install = new InstallVscode();
              await install.extentions();
            } catch (e) {
              console.log(colors.red(e.message));
            }
            break;
          case 'subl':
            break;
          default:
            break;
        }
      }
    });
  }
}

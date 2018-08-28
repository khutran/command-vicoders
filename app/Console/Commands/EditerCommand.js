import { Command } from './Command';
import _ from 'lodash';
import colors from 'colors';
import InstallVscode from '../../Utils/Installs/InstallVscode';

export default class VscodeCommand extends Command {
  signature() {
    return 'editer';
  }

  description() {
    return ['Install - Manager Editer of computer'];
  }

  options() {
    return [{ key: 'install', description: 'install vscode or subl' }, { key: 'install-extentions', description: 'install extention vscode or subl' }];
  }

  async handle(option) {
    let data = {
      install: option.install,
      installExtentions: option.installExtentions
    };
    for (const i in data) {
      if (_.isUndefined(data[i])) {
        delete data[i];
      }
    }
    _.mapKeys(data, async (value, key) => {
      if (key === 'install') {
        switch (value) {
          case 'vscode':
            try {
              const install = new InstallVscode();
              await install.run();
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

import { Command } from './Command';
import _ from 'lodash';
import colors from 'colors';
import InstallVscode from '../../Utils/Installs/InstallVscode';
import InstallSubl from '../../Utils/Installs/installSubl';
import installNginx from '../../Utils/Installs/installNginx';
import installApache from '../../Utils/Installs/installApache';
import installPhp from '../../Utils/Installs/InstallPhp';
import inquirer from 'inquirer';
// import of from 'await-of';

export default class VscodeCommand extends Command {
  signature() {
    return 'install <service>';
  }

  description() {
    return ['Install - Manager Editer of computer'];
  }

  options() {
    return [];
  }

  async handle(service, option) {
    const listService = {
      1: {
        name: 'subl'
      },
      2: {
        name: 'vscode'
      },
      3: {
        name: 'nginx'
      },
      4: {
        name: 'apache'
      },
      5: {
        name: 'php'
      }
    };

    _.mapKeys(listService, (value, key) => {
      console.log(`${key} : ${value.name}`);
    });
    const answers = await inquirer.prompt({ type: 'input', name: 'service', message: 'select service want install : ', default: 1 });
    service = listService[answers.service];
    switch (service.name) {
      case 'vscode':
        try {
          const install = new InstallVscode();
          const result = await install.service();
          if (result.code === 1) {
            console.log(colors.green(result.message));
          }
          const extention = await inquirer.prompt({ type: 'confirm', name: 'extention', message: 'you want install extentions : ', default: true });
          if (extention.extention) {
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
          const extention = await inquirer.prompt({ type: 'confirm', name: 'extention', message: 'you want install extentions : ', default: true });
          if (extention.extention) {
            await install.extentions();
          }
        } catch (e) {
          console.log(colors.red(e.message));
        }
        break;
      case 'nginx':
        try {
          const install = new installNginx();
          await install.service();
          console.log(colors.green('success .. !'));
        } catch (e) {
          console.log(colors.red(e.message));
        }
        break;
      case 'apache':
        try {
          const install = new installApache();
          await install.service();
          console.log(colors.green('success .. !'));
        } catch (e) {
          console.log(colors.red(e.message));
        }
        break;
      case 'php':
        try {
          const version = '7.2';
          const install = new installPhp();
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

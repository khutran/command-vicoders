import { Command } from './Command';
import * as _ from 'lodash';
import colors from 'colors';
import ProjectRepository from '../../Repositories/ProjectRepository';
import Os from '../../Utils/Os/Os';
import Darwin from '../../Utils/Os/Darwin';
import Linux from '../../Utils/Os/Linux';
import { Exception } from '@nsilly/exceptions';
import { exec } from 'child-process-promise';
import inquirer from 'inquirer';

export default class OpenCommand extends Command {
  signature() {
    return 'open <project>';
  }

  description() {
    return ['Open - Open with editer vscode | subl'];
  }

  options() {
    return [{ key: 'e', description: 'select vscode or subl' }];
  }

  async handle(project, option) {
    try {
      let editer = 'code';
      const os = new Os().platform();
      if (os === 'darwin') {
        const darwin = new Darwin();
        if (!(await darwin.CheckExists('code'))) {
          if (!(await darwin.CheckExists('subl'))) {
            throw new Exception('You not install vscode or subl');
          }
        }
      }
      if (os === 'linux') {
        const linux = new Linux();
        if (!(await linux.CheckExists('code'))) {
          if (!(await linux.CheckExists('subl'))) {
            throw new Exception('You not install vscode or subl');
          }
        }
      }
      if (!_.isNil(option.e)) {
        editer = option.e;
      }
      switch (project) {
        case 'host':
          let path_host = '/etc/hosts';
          if (os === 'win32') {
            path_host = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
          }
          console.log(`open : ${path_host}`);
          await exec(`${editer} ${path_host}`);
          break;
        case 'config':
          await exec(`${editer} ${__dirname}/../../config/config.json`);
          break;
        default:
          const repository = new ProjectRepository();

          if (!project) {
            const list = await repository.get();
            _.mapKeys(list, (value, key) => {
              console.log(`${parseInt(key) + 1} : ${value.name}`);
            });

            const as = await inquirer.prompt({ type: 'input', name: 'project', message: 'Select project  : ' });

            if (as.project) {
              project = as.project;
            }
          }

          const item = await repository
            .orWhere('name', 'like', project)
            .orWhere('id', 'like', project)
            .first();
          if (!item) {
            throw new Exception('Project not exists  !', 1);
          }
          if (!_.isUndefined(option.e)) {
            if (option.e === 'vscode') {
              editer = 'code';
            } else {
              editer = option.e;
            }
          }
          await exec(`${editer} ${item.dir_home}`);
          break;
      }
    } catch (e) {
      console.log(colors.red(e.message));
    }
  }
}

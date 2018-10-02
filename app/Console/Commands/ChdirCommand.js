import { Command } from './Command';
import * as _ from 'lodash';
import colors from 'colors';
import ProjectRepository from '../../Repositories/ProjectRepository';
import { Exception } from '@nsilly/exceptions';
import inquirer from 'inquirer';

export default class CdCommand extends Command {
  signature() {
    return 'cd <project>';
  }

  description() {
    return ['Open - Open with editer vscode | subl'];
  }

  options() {
    return [];
  }

  async handle(project) {
    try {
      const repository = new ProjectRepository();

      if (!project) {
        const list = await repository.get();
        _.mapKeys(list, value => {
          console.log(`${value.id} : ${value.name}`);
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

      process.chdir(item.dir_home);
    } catch (e) {
      console.log(colors.red(e.message));
    }
  }
}

import { Command } from './Command';
import * as _ from 'lodash';
import colors from 'colors';
import ProjectRepository from '../../Repositories/ProjectRepository';
import inquirer from 'inquirer';
import { Exception } from '@nsilly/exceptions';
import { spawn } from 'child_process';

export default class ChdirCommand extends Command {
  signature() {
    return 'cd <project>';
  }

  description() {
    return ['cd to project !'];
  }

  options() {
    return [];
  }

  async handle(project) {
    try {
      const repository = new ProjectRepository();

      if (!project) {
        const list = await repository.get();
        _.map(list, value => {
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

      spawn('bash', ['-i'], {
        cwd: item.dir_home,
        env: process.env,
        stdio: 'inherit'
      });
    } catch (e) {
      console.log(colors.red(e.message));
    }
  }
}

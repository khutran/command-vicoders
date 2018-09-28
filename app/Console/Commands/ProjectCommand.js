import { Command } from './Command';
import * as _ from 'lodash';
import colors from 'colors';
import ProjectRepository from '../../Repositories/ProjectRepository';
import ApiResponse from '../../Responses/ApiResponse';
import ManagerProjects from '../../Utils/ManagerProjects';
import inquirer from 'inquirer';
import remoteOriginUrl from 'remote-origin-url';
import GitUrlParse from 'git-url-parse';

const path = require('path');

export default class ProjectCommand extends Command {
  signature() {
    return 'project <select>';
  }

  description() {
    return [];
  }

  options() {
    return [];
  }

  async handle(select) {
    try {
      const repository = new ProjectRepository();
      const manager = new ManagerProjects();
      switch (select) {
        case '.':
          const data = {
            name: path.basename(process.cwd()),
            dir_home: process.cwd(),
            framework: await manager.framework()
          };
          const remote = remoteOriginUrl.sync();
          const url = GitUrlParse(remote);
          data.git_remote = `https://${url.source}/${url.full_name}.git`;

          data.port = await manager.getPort();
          if (data.name === 'workspace' || data.name === 'public_html') {
            data.name = path.basename(path.dirname(process.cwd()));
          }
          const item = await repository.where('name', data.name).first();
          if (item) {
            let update_project = {};
            const name = await inquirer.prompt({ type: 'input', name: 'value', message: 'Update name project  : ', default: item.name });
            const framework = await inquirer.prompt({ type: 'input', name: 'value', message: 'Update framework project  : ', default: item.framework });
            const dir_home = await inquirer.prompt({ type: 'input', name: 'value', message: 'Update dir_home project  : ', default: item.dir_home });
            const git_remote = await inquirer.prompt({ type: 'input', name: 'value', message: 'Update git_remote project  : ', default: item.git_remote });
            const port = await inquirer.prompt({ type: 'input', name: 'value', message: 'Update port project  : ', default: item.port });
            update_project.name = name.value;
            update_project.framework = framework.value;
            update_project.dir_home = dir_home.value;
            update_project.git_remote = git_remote.value;
            update_project.port = port.value;
            await item.update(update_project);
          } else {
            await repository.create(data);
          }
          console.log(colors.green(ApiResponse.success()));
          break;
        case 'list':
          _.mapKeys(await repository.get(), (value, key) => {
            console.log(`${parseInt(key) + 1} : ${colors.green(value.name)} - (${colors.gray(value.framework)}) -> ${colors.yellow(value.dir_home)}`);
          });
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(colors.red(e));
    }
  }
}

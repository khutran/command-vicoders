import { Command } from './Command';
import _ from 'lodash';
import colors from 'colors';
import ProjectRepository from '../../Repositories/ProjectRepository';
import ProjectTransformer from '../../Transformers/ProjectTranformer';
import ApiResponse from '../../Responses/ApiResponse';
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class ProjectCommand extends Command {
  signature() {
    return 'project <router>';
  }

  description() {
    return [];
  }

  options() {
    return [];
  }

  async handle(router) {
    try {
      const repository = new ProjectRepository();
      switch (router) {
        case '.':
          const data = {
            name: path.basename(process.cwd()),
            dir_home: process.cwd()
          };

          const git_remote = await exec('git remote -v');
          const i = _.split(git_remote.stdout, '\n');
          data.git_remote = i[0].slice(7, -8);

          const item = await repository.where('name', data.name).first();
          if (item) {
            await item.update(data);
          } else {
            await repository.create(data);
          }
          console.log(colors.green(ApiResponse.success()));
          break;
        case 'list':
          console.info(ApiResponse.collection(await repository.get(), new ProjectTransformer()));
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(colors.red(e));
    }
  }
}

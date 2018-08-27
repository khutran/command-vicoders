import { Command } from './Command';
import _ from 'lodash';
import { Exception } from '@codersvn/exceptions';
import colors from 'colors';
import ProjectRepository from '../../Repositories/ProjectRepository';
import ProjectTransformer from '../../Transformers/ProjectTranformer';
import ApiResponse from '../../Responses/ApiResponse';
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class ProjectCommand extends Command {
  signature() {
    return 'project <<router>>';
  }

  description() {
    return [];
  }

  options() {
    return [];
  }

  async handle(router, options) {
    try {
      const repository = new ProjectRepository();
      switch (router) {
        case '.':
          let data = {
            name: path.basename(process.cwd()),
            dir_home: process.cwd()
          };

          const git_remote = await exec('git remote -v');
          let i = _.split(git_remote.stdout, '\n');
          data.git_remote = i[0].slice(7, -8);

          await repository.create(data);
          console.log(colors.green(ApiResponse.success()));
          break;
        case 'list':
          console.info(ApiResponse.collection(await repository.show(), new ProjectTransformer()));
          break;
        case 'update':
          let update_data = {
            name: path.basename(process.cwd()),
            dir_home: process.cwd()
          };

          const update_git_remote = await exec('git remote -v');
          let u = _.split(update_git_remote.stdout, '\n');
          update_data.git_remote = u[0].slice(7, -8);

          await repository.where('name', update_data.name).update(update_data);
          console.log(colors.green(ApiResponse.success()));
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(colors.red(e));
    }
  }
}

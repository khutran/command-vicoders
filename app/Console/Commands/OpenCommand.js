import { Command } from './Command';
import _ from 'lodash';
import colors from 'colors';
import ProjectRepository from '../../Repositories/ProjectRepository';
import { Exception } from '../../Exceptions/Exception';
import Os from '../../Utils/Os/Os';
import Darwin from '../../Utils/Os/Darwin';
import Linux from '../../Utils/Os/Linux';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

export default class OpenCommand extends Command {
  signature() {
    return 'open <<project>>';
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
        if (!darwin.CheckExists('code')) {
          if (!darwin.CheckExists('subl')) {
            throw new Exception('You not install vscode or subl');
          }
          editer = 'subl';
        }
      }
      if (os === 'linux') {
        const linux = new Linux();
        if (!linux.CheckExists('code')) {
          if (!linux.CheckExists('subl')) {
            throw new Exception('You not install vscode or subl');
          }
          editer = 'subl';
        }
      }
      const repository = new ProjectRepository();
      const item = await repository.where('name', project).first();
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
      exec(`${editer} ${item.dir_home}`);
    } catch (e) {
      console.log(colors.red(e.message));
    }
  }
}

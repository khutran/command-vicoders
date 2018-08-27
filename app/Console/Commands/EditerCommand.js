import { Command } from './Command';
import _ from 'lodash';
import { spawn } from 'child_process';
import os from 'os';
import chownr from 'chownr';
import { Exception } from '../../Exceptions/Exception';
import colors from 'colors';
import fs from 'fs';
import InstallVscode from '../../Utils/Installs/InstallVscode';
const util = require('util');
const rimraf = util.promisify(require('rimraf'));

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
    try {
      let data = {
        install: option.install,
        installExtentions: option.installExtentions
      };
      for (let i in data) {
        if (_.isUndefined(data[i])) {
          delete data[i];
        }
      }
      console.log(data);
      // await new InstallVscode().run();
      // if (option.installExtentions) {
      //   const user = os.userInfo();
      //   console.log('Clear extentions ....');
      //   if (!fs.existsSync(`${user.homedir}/.vscode`)) {
      //     throw new Exception('VIsual studio not install', 2);
      //   }
      //   await rimraf(`${user.homedir}/.vscode/extensions`);
      //   console.log(`Clear extentions .... ${colors.green('done')}`);
      //   const extension = spawn('git', ['clone', 'https://github.com/codersvn/vscode_extensions.git', `${user.homedir}/.vscode/extensions`]);
      //   extension.stderr.on('data', data => {
      //     if (data.indexOf('done') > -1) {
      //       data = _.replace(data, ', done.', '');
      //     }
      //     console.log(`${data}`);
      //   });
      //   extension.on('close', code => {
      //     chownr(`${user.homedir}/.vscode/extensions`, user.uid, user.gid, err => {
      //       if (err) {
      //         throw new Exception(err.messages);
      //       }
      //     });
      //     console.log(`Install ... ${code} ${colors.green('done')}`);
      //   });
      // }
    } catch (e) {
      console.log(colors.red(e.message));
    }
  }
}

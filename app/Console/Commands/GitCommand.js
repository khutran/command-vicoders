import { Command } from './Command';
import inquirer from 'inquirer';
import * as _ from 'lodash';
import opn from 'opn';
import remoteOriginUrl from 'remote-origin-url';
import GitUrlParse from 'git-url-parse';

export default class GitCommand extends Command {
  signature() {
    return 'git';
  }

  description() {
    return 'All you need for your git';
  }

  options() {}

  async handle() {
    const urlParser = () => {
      const remote = remoteOriginUrl.sync();
      const data = GitUrlParse(remote);
      const url = `https://${data.source}/${data.full_name}`;
      return url;
    };

    const openRepositoryPage = async () => {
      const url = urlParser();
      await opn(url);
    };

    const openCommitPage = async () => {
      const url = urlParser() + '/commits';
      await opn(url);
    };

    const openPullRequestPage = async () => {
      let url = urlParser();
      if (url.indexOf('github.com') > -1) {
        url += '/pulls';
      } else if (url.indexOf('bitbucket.org') > -1) {
        url += '/pull-requests';
      }
      await opn(url);
    };

    const openNewPullRequestPage = async () => {
      let url = urlParser();
      if (url.indexOf('github.com') > -1) {
        url += '/compare';
      } else if (url.indexOf('bitbucket.org') > -1) {
        url += '/pull-requests/new';
      }
      await opn(url);
    };
    const availbleCommands = [
      { description: 'Open repository on your browser', handle: openRepositoryPage },
      { description: 'Open commits page', handle: openCommitPage },
      { description: 'Open pull request page', handle: openPullRequestPage },
      { description: 'New pull request', handle: openNewPullRequestPage }
    ];
    let message = 'Select task that you want \n\n';
    availbleCommands.forEach((item, key) => {
      message += `${key + 1}. ${item.description} \n`;
    });
    console.log(message);

    const answer = await inquirer.prompt({ type: 'input', name: 'command', message: 'Task Number: ', default: 1 });
    const command = availbleCommands[Number(answer.command) - 1];
    if (_.isUndefined(command)) {
      Error('Command not found');
    }
    await command.handle();

    process.exit();
  }
}

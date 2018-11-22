import { Command } from './Command';
import 'colors';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';

export default class SetupVicodersPackageRepositoryCommand extends Command {
  signature() {
    return 'setup-vicoders-repository';
  }

  description() {
    return 'Make your composer compatitive with Vicoders Repository';
  }

  options() {}

  async handle() {
    const composer_file_path = path.resolve(process.cwd(), 'composer.json');
    let raw = require(composer_file_path);
    if (_.isObject(raw) && _.isArray(raw.repositories)) {
      const repositories = raw.repositories;
      if (_.isUndefined(_.find(repositories, item => item.type === 'composer' && item.url.indexOf('packages.vicoders.com') > -1))) {
        raw.repositories = [
          ...raw.repositories,
          ...[
            {
              type: 'composer',
              url: 'https://packages.vicoders.com'
            }
          ]
        ];
      }
    } else {
      raw = Object.assign(raw, {
        repositories: [
          {
            type: 'composer',
            url: 'https://packages.vicoders.com'
          }
        ]
      });
    }
    console.log(`Updating ${composer_file_path.green}`);
    fs.writeFileSync(composer_file_path, JSON.stringify(raw, null, 2));
  }
}

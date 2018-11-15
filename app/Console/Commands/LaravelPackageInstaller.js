import { Command } from './Command';
import { Helpers } from '../../Utils/Helpers';

export default class LaravelPackageInstaller extends Command {
  signature() {
    return 'laravel';
  }

  description() {
    return 'Install laravel package';
  }

  options() {}

  async handle() {
    const package_name = await Helpers.select('package', [
      { type: 'usermanager', description: 'Vicoders User Manager' },
      { type: 'postmanager', description: 'Vicoders Post Manager' },
      { type: 'core', description: 'Vicoders Core Module' }
    ]);
    switch (package_name.type) {
      case 'usermanager':
        let msg = '';
        msg += await Helpers.exec('composer require codersvn/usermanagement');
        msg += await Helpers.exec('./node_modules/.bin/ng generate @vicoders/laravelgenerator:installer --package=usermanagement');
        console.log(msg);

        break;
      default:
        break;
    }
  }
}

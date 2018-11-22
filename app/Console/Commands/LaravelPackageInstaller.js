import { Command } from './Command';
import { Helpers } from '../../Utils/Helpers';

export default class LaravelPackageInstaller extends Command {
  signature() {
    return 'laravel';
  }

  description() {
    return 'Install laravel package';
  }

  options() {
    return [{ key: 'migrate?', description: 'Run migrate command also' }];
  }

  async handle(options) {
    const package_name = await Helpers.select('package', [
      { type: 'usermanager', description: 'Vicoders User Manager' },
      { type: 'postmanager', description: 'Vicoders Post Manager' },
      { type: 'core', description: 'Vicoders Core Module' }
    ]);
    switch (package_name.type) {
      case 'usermanager':
        await Helpers.spawn('vcsupport setup-vicoders-repository');
        await Helpers.spawn('composer require vicoders/usermanager');
        await Helpers.spawn('npm install @vicoders/generator --save-dev');
        await Helpers.spawn(`mv config/auth.php config/auth.php.${Math.round(Math.random() * 1000)}.bak`);
        await Helpers.spawn('node_modules/.bin/ng generate @vicoders/generator:installer --package=usermanagement');

        await Helpers.exec('php artisan vendor:publish --provider="VCComponent\\Laravel\\User\\Providers\\UserComponentProvider"');
        await Helpers.exec('php artisan vendor:publish --provider="Dingo\\Api\\Provider\\LaravelServiceProvider"');
        await Helpers.exec('php artisan vendor:publish --provider="Tymon\\JWTAuth\\Providers\\LaravelServiceProvider"');
        await Helpers.exec('php artisan vendor:publish --provider "Prettus\\Repository\\Providers\\RepositoryServiceProvider"');

        await Helpers.spawn('php artisan jwt:secret');
        if (options.migrate === true) {
          await Helpers.spawn('php artisan migrate');
        }
        break;
      default:
        break;
    }
  }
}

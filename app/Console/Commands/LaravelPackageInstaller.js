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
        await Helpers.spawn('vcsupport setup-vicoders-repository');
        await Helpers.spawn('composer require vicoders/usermanager');
        await Helpers.spawn('npm install @vicoders/generator --save-dev');
        await Helpers.spawn(`mv config/auth.php config/auth.php.${Math.round(Math.random() * 1000)}.bak`);
        await Helpers.spawn('node_modules/.bin/ng generate @vicoders/generator:installer --package=usermanagement');
        const publishCommands = [
          'php artisan vendor:publish --provider="VCComponentLaravelUserProvidersUserComponentProvider"',
          'php artisan vendor:publish --provider="DingoApiProviderLaravelServiceProvider"',
          'php artisan vendor:publish --provider="TymonJWTAuthProvidersLaravelServiceProvider"',
          'php artisan vendor:publish --provider "PrettusRepositoryProvidersRepositoryServiceProvider"'
        ];
        for (const command of publishCommands) {
          await Helpers.spawn(command);
        }
        await Helpers.spawn('php artisan jwt:secret');
        await Helpers.spawn('php artisan migrate');
        break;
      default:
        break;
    }
  }
}

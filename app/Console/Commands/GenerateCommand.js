import { Command, Error, Warning } from './Command';
import inquirer from 'inquirer';
import _ from 'lodash';
import { AngularResourceComponent } from '../../Entities/AngularResourceComponent';

export default class GenerateCommand extends Command {
  signature() {
    return 'generate';
  }

  description() {
    return 'Vicoder Resource Component Generator';
  }

  options() {
    return [{ key: 'name', description: 'The description for option here' }];
  }

  async handle(options) {
    if (options.name === undefined) {
      Error('--name is required');
    }

    const component = new AngularResourceComponent();
    component.setOption('name', options.name);

    const select = async (name, options, message) => {
      message = message || `Select "${name}"`;
      message = `\n${message} \n\n`;
      options.forEach((item, key) => {
        message += `${key + 1}. ${item.description} \n`;
      });

      console.log(message);

      let answer;

      while (answer === undefined) {
        const iqr = await inquirer.prompt({ type: 'input', name: name, message: 'Your choice: ', default: 1 });
        if (Number(iqr[name]) <= options.length) {
          answer = options[Number(iqr[name]) - 1];
          break;
        } else {
          Warning('Please select available option');
        }
      }
      return answer;
    };

    const ask = async (message, default_msg) => {
      const answer = await inquirer.prompt({ type: 'input', name: 'ask', message: message, default: default_msg });
      return answer.ask;
    };

    const type = await select('type', [
      { type: 'component', description: 'Generate a resource component' },
      { type: 'module', description: 'Generate a module' },
      { type: 'single', description: 'Generate a component' }
    ]);
    component.setOption('type', type.type);

    const askForComponent = async () => {
      const componentpath = await ask('Where your component located (inside src/app/components):', '/');
      if (!_.isNil(componentpath) && componentpath !== '/') {
        component.setOption('component', componentpath);
      }
    };

    const askForApi = async () => {
      let api;
      while (api === undefined) {
        api = await ask('What is api to use:', '');
        if (_.isNil(api) || api === '') {
          api = undefined;
          Warning('api is required if it s not generated');
        } else {
          component.setOption('api', api);
          break;
        }
      }
    };

    const askForModel = async () => {
      let model;
      while (model === undefined) {
        model = await ask('What is model to use:', '');
        if (_.isNil(model) || model === '') {
          model = undefined;
          Warning('Model is required');
        } else {
          component.setOption('model', model);
          break;
        }
      }
    };

    const handleComponentGenerate = async () => {
      const availabel_modules = ['api', 'model', 'component'];
      const module = await inquirer.prompt({ type: 'input', name: 'module', message: 'Which part that you want to generate: ', default: 'api,model,component' });
      const selected_modules = _.intersection(availabel_modules, module.module.split(','));
      component.setOption('with', selected_modules.join(','));
      if (_.includes(selected_modules, 'api')) {
        const apifolderpath = await ask('Where your api located (inside src/app/api):', '/');
        if (!_.isNil(apifolderpath) && apifolderpath !== '/') {
          component.setOption('apifolderpath', apifolderpath);
        }
      } else {
        await askForApi();
      }
      if (!_.includes(selected_modules, 'model')) {
        await askForModel();
      }
      await askForComponent();
    };

    const handleModuleGenerate = async () => {
      await askForComponent();
    };

    const handleSingleGenerate = async () => {
      await askForComponent();
      await askForApi();
      await askForModel();
    };

    switch (type.type) {
      case 'component':
        await handleComponentGenerate();
        break;
      case 'module':
        await handleModuleGenerate();
        break;
      case 'single':
        await handleSingleGenerate();
        break;

      default:
        break;
    }
    try {
      const data = await component.exec();
      console.log(data);
    } catch (error) {
      Error(error.message);
    }
  }
}

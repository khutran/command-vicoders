import inquirer from 'inquirer';
import { Warning } from '../Console/Commands/Command';
import _ from 'lodash';
import { exec, spawn } from 'child_process';

export class Helpers {
  /**
   * Generate select question
   *
   * @param {*} name
   * @param {*} options
   * @param {*} message
   */
  static async select(name, options, message) {
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
  }

  /**
   * Ask for answer
   *
   * @param {*} message
   * @param {*} default_msg
   */
  static async ask(message, default_msg) {
    const answer = await inquirer.prompt({ type: 'input', name: 'ask', message: message, default: default_msg });
    return answer.ask;
  }
  /**
   * Execute command
   *
   * @param {*} command
   */
  static exec(command) {
    return new Promise((resolve, reject) => {
      const options = [];
      _.forEach(this.availabel_options, opt => {
        if (!_.isNil(this[opt])) {
          options.push(`--${opt}="${this[opt]}"`);
        }
      });

      console.log(`\n${command}\n`);

      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        resolve(stdout + '\n' + stderr);
      });
    });
  }
  /**
   * Execute command with spawn
   *
   * @param {*} command
   */
  static spawn(command) {
    return new Promise(resolve => {
      const cmd = spawn(command.split(' ')[0], command.split(' ').slice(1));
      cmd.stdout.on('data', data => {
        console.log(data.toString());
      });
      cmd.stderr.on('data', data => {
        console.log(data.toString());
      });
      cmd.on('close', code => {
        resolve(code);
      });
    });
  }
}

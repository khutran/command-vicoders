import { Command, Info } from './Command';
import clipboardy from 'clipboardy';

export default class PwdCommand extends Command {
  signature() {
    return 'pwd';
  }

  description() {
    // Description is optional
    return 'Print current working directory and copy it to clipboard';
  }

  options() {}

  async handle() {
    clipboardy.writeSync(process.cwd());
    Info(process.cwd());
    process.exit();
  }
}

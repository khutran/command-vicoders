import vscode from './Commands/Vscode';
import MakeCommandCommand from './Commands/MakeCommandCommand';

export class Kernel {
  commands() {
    return [vscode, MakeCommandCommand];
  }
}

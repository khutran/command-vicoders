import vscode from "./Commands/Vscode";
import project from "./Commands/Project";

export class Kernel {
  commands() {
    return [vscode, project];
  }
}

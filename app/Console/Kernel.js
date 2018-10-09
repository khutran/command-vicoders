import MakeCommandCommand from './Commands/MakeCommandCommand';
import ProjectCommand from './Commands/ProjectCommand';
import OpenCommand from './Commands/OpenCommand';
import CreateProjectCommand from './Commands/CreateProjectCommand';
import InstallServiceCommand from './Commands/InstallServiceCommand';
import CreateConfigCommand from './Commands/CreateConfigCommand';
import InitCommand from './Commands/InitCommand';
import GitCommand from './Commands/GitCommand';
import PwdCommand from './Commands/PwdCommand';
import ChdirCommand from './Commands/ChdirCommand';

export class Kernel {
  commands() {
    return [ChdirCommand, MakeCommandCommand, InstallServiceCommand, ProjectCommand, OpenCommand, CreateProjectCommand, CreateConfigCommand, InitCommand, GitCommand, PwdCommand];
  }
}

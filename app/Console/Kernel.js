import MakeCommandCommand from './Commands/MakeCommandCommand';
import ProjectCommand from './Commands/ProjectCommand';
import OpenCommand from './Commands/OpenCommand';
import CreateProjectCommand from './Commands/CreateProjectCommand';
import InstallServiceCommand from './Commands/InstallServiceCommand';
import CreateConfigCommand from './Commands/CreateConfigCommand';
import ConfigCommand from './Commands/ConfigCommand';
import InitCommand from './Commands/InitCommand';
import GitCommand from './Commands/GitCommand';
import PwdCommand from './Commands/PwdCommand';

export class Kernel {
  commands() {
    return [MakeCommandCommand, InstallServiceCommand, ProjectCommand, OpenCommand, CreateProjectCommand, CreateConfigCommand, ConfigCommand, InitCommand, GitCommand, PwdCommand];
  }
}

import MakeCommandCommand from './Commands/MakeCommandCommand';
import EditerCommand from './Commands/EditerCommand';
import ProjectCommand from './Commands/ProjectCommand';
import OpenCommand from './Commands/OpenCommand';
import CreateProjectCommand from './Commands/CreateProjectCommand';

export class Kernel {
  commands() {
    return [MakeCommandCommand, EditerCommand, ProjectCommand, OpenCommand, CreateProjectCommand];
  }
}

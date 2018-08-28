import MakeCommandCommand from './Commands/MakeCommandCommand';
import EditerCommand from './Commands/EditerCommand';
import ProjectCommand from './Commands/ProjectCommand';
import OpenCommand from './Commands/OpenCommand';
export class Kernel {
  commands() {
    return [MakeCommandCommand, EditerCommand, ProjectCommand, OpenCommand];
  }
}

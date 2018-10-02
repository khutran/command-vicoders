import Repository from './Repository';
import { project } from '../../models';

export default class ProjectRepository extends Repository {
  Models() {
    return project;
  }
}

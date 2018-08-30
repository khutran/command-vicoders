import Repository from './Repository';
import models from '../../models';

export default class ProjectRepository extends Repository {
  Models() {
    return models.project;
  }
}

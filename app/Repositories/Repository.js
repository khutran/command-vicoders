import { Repository as DefaultRepository } from '@nsilly/repository';
import models from '../../models';

export default class Repository extends DefaultRepository {
  constructor() {
    super();
    this.builder.setModels(models);
  }
}

import { Repository as DefaultRepository } from '@codersvn/repository';
import models from '../../models';

export default class Repository extends DefaultRepository {
  constructor() {
    super();
    this.builder.setModels(models);
  }
}

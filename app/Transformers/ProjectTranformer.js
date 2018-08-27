import Transformer from './Transformer';

export default class ProjectTransformer extends Transformer {
  transform(model) {
    return {
      name: model.name,
      dir_home: model.dir_home,
      git_remote: model.git_remote
    };
  }
}

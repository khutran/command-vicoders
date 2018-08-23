import Transformer from "./Transformer";

export default class ProjectTransformer extends Transformer {
  transform(model) {
    return {
      id: model.id,
      name: model.name,
      dir_home: model.dir_home,
      git_remote: model.git_remote,
      created_at: model.created_at,
      updated_at: model.updated_at
    };
  }
}

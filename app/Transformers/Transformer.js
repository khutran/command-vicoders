import * as _ from 'lodash';
import { Exception } from '../Exceptions/Exception';

export default class Transformer {
  constructor(includes = []) {
    if (includes.length > 0) {
      this.includes = includes;
    } else if (_.isFunction(this.defaultIncludes)) {
      const default_permissions = this.defaultIncludes();
      if (_.isArray(default_permissions) && default_permissions.length > 0) {
        this.includes = default_permissions;
      } else {
        this.includes = [];
      }
    } else {
      this.includes = [];
    }
  }

  item(obj, transformer) {
    if (_.isNil(obj)) {
      return null;
    }
    return { data: transformer.get(obj) };
  }

  collection(collection, transformer) {
    if (!_.isArray(collection)) {
      return [];
    }
    const data = _.map(collection, i => {
      return transformer.get(i);
    });
    return { data: data };
  }

  get(model) {
    const data = this.transform(model);
    if (this.includes.length > 0) {
      _.forEach(this.includes, include => {
        let f = _.camelCase(`include_${include}`);
        if (!_.isFunction(this[f])) {
          throw new Exception(`${f} function is missing`, 1000);
        }
        data[include] = this[f](model);
      });
    }
    return data;
  }

  with(include) {
    this.includes.push(include);
    return this;
  }
}

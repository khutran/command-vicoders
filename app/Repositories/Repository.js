import * as _ from "lodash";
import { Exception } from "../Exceptions/Exception";

export default class Repository {
  constructor() {
    this.wheres = {};
  }

  async firts() {
    let params = {
      where: this.wheres
    };
    const result = await model.findOne(params);
    return result;
  }

  async getById(id) {
    let params = {
      where: {
        id: id
      }
    };
    const result = await this.Models().findOne(params);
    return result;
  }

  async show() {
    let params = {
      where: this.wheres
    };
    const result = await this.Models().findAll(params);
    return result;
  }

  async create(attributes) {
    if (_.isNil(attributes)) {
      throw new Exception("attributes should not empty", 1000);
    }

    const result = await this.Models().sequelize.transaction(
      function(t) {
        return this.Models().create(attributes, { transaction: t });
      }.bind(this)
    );
    if (_.isNil(result)) {
      throw new Exception("Can not create resource", 1004);
    }

    return result;
  }

  async update(attributes) {
    let params = {
      where: this.wheres
    };
    const result = await this.Models().update(attributes, params);
    return result;
  }

  where(...args) {
    this.wheres[args[0]] = args[1];
    return this;
  }
}

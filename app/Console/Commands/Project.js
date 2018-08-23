import { Command } from "./Command";
import _ from "lodash";
import { Exception } from "../../Exceptions/Exception";
import colors from "colors";
import ProjectRepository from "../../Repositories/ProjectRepository";
import ProjectTransformer from "../../Transformers/ProjectTranformer";
import ApiResponse from "../../Responses/ApiResponse";
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

export default class Project extends Command {
  signature() {
    return "project <<router>>";
  }

  description() {
    return "";
  }

  options() {
    return [];
  }

  async handle(router, options) {
    try {
      const repository = new ProjectRepository();
      switch (router) {
        case ".":
          let data = {
            name: path.basename(process.cwd()),
            dir_home: process.cwd()
          };

          const git_remote = await exec("git remote -v");
          let i = _.split(git_remote.stdout, "\n");
          data.git_remote = i[0].slice(7, -8);

          const result = await repository.create(data);
          console.log(colors.green(ApiResponse.success()));
          break;
        case "list":
          const list = await repository.show();
          console.log(ApiResponse.collection(list, new ProjectTransformer()));
          break;
        default:
          break;
      }
    } catch (e) {
      console.log(colors.red(e));
    }
  }
}

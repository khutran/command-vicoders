import { Command } from "./Command";
import _ from "lodash";
import { spawn } from "child_process";
const util = require("util");
import os from "os";
import chownr from "chownr";
import { Exception } from "../../Exceptions/Exception";
const rimraf = util.promisify(require("rimraf"));
import colors from "colors";
import fs from "fs";

export default class Vscode extends Command {
  signature() {
    return "vscode";
  }

  description() {
    return "Install Visual studio";
  }

  options() {
    return [{ key: "install?", description: "default true" }];
  }

  async handle(options) {
    if (!_.isUndefined(options.install) && options.install === true) {
      const user = os.userInfo();
      console.log("Clear extentions ....");
      if (!fs.existsSync(`${user.homedir}/.vscode`)) {
        throw new Exception("VIsual studio not install", 2);
      }
      await rimraf(`${user.homedir}/.vscode/extensions`);
      console.log(`Clear extentions .... ${colors.green("done")}`);

      const extension = spawn("git", [
        "clone",
        "https://github.com/codersvn/vscode_extensions.git",
        `${user.homedir}/.vscode/extensions`
      ]);

      extension.stderr.on("data", data => {
        if (data.indexOf("done") > -1) {
          data = _.replace(data, ", done.", "");
        }
        console.log(`${data}`);
      });

      extension.on("close", code => {
        chownr(
          `${user.homedir}/.vscode/extensions`,
          user.uid,
          user.gid,
          err => {
            if (err) {
              throw new Exception(err.messages);
            }
          }
        );
        console.log(`Install ... ${colors.green("done")}`);
      });
    }
  }
}

import { Command } from "./Command";
import _ from "lodash";
import { spawn } from "child_process";
import path from "path";
const util = require("util");
const exec = util.promisify(require("child_process").exec);
import os from "os";

export default class UpdateProjectTableBuildtimeAndCloudflareCommand extends Command {
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
      const oprator = os.platform();
      console.log(oprator);
      // const extension = spawn("git", [
      //   "clone",
      //   "https://github.com/codersvn/vscode_extensions.git"
      //   // "/root/.vscode"
      // ]);

      // extension.stdout.on("data", data => {
      //   console.log(`stdout: ${data}`);
      // });

      // extension.stderr.on("data", data => {
      //   console.log(`stderr: ${data}`);
      // });

      // extension.on("close", code => {
      //   console.log(`child process exited with code ${code}`);
      // });
    }
    // process.exit();
  }
}

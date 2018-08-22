#!/usr/bin/env node

import program from "commander";
import { Kernel } from "./app/Console/Kernel";
import _ from "lodash";
import { Exception } from "./app/Exceptions/Exception";

program.version("1.0.0");
const kernel = new Kernel();
const commands = kernel.commands();

_.forEach(commands, command => {
  const instance = new command();
  if (
    _.isFunction(instance.options) &&
    _.isArray(instance.options()) &&
    instance.options().length > 0
  ) {
    const cmd = program
      .command(instance.signature())
      .description(instance.description());
    const options = instance.options();
    
    for (const option of options) {
      if (_.isUndefined(option.key)) {
        throw new Exception("Option key is required", 1);
      }
      if (_.isUndefined(option.description)) {
        throw new Exception(`"${option.key}" option must have description`, 1);
      }
      cmd.option(
        option.key.slice(-1) === "?"
          ? `--${option.key.slice(0, -1)}`
          : `--${option.key} <${option.key}>`,
        option.description
      );
    }
    cmd.action(instance.handle);
  } else {
    program
      .command(instance.signature())
      .description(instance.description())
      .action(instance.handle);
  }
});
program.parse(process.argv);

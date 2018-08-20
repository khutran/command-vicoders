#!/usr/bin/env node

const program = require("commander");
const _ = require("lodash");
const subcommand = require("./subcommand");
const colors = require("colors");

let o = {};
if (_.isUndefined(process.argv[2])) {
  throw new Error("command not undefined");
}


_.forEach(subcommand, item => {
  if (process.argv[2] === item.name) {
    _.assign(o, item);
  }
});

let cmd = program.command(o.name);
_.forEach(o.options, op => {
  cmd.option(op.toString());
});
cmd.action(o.action);

program.parse(process.argv);

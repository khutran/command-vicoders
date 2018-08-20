const colors = require("colors");

module.exports = {
  name: "editer",
  options: [
    ["-s, --sugar [value]", "Sugar level", "Low"],
    ["-d, --decaf", "Decaf coffee"],
    ["-c, --cold", "Cold coffee"],
    ["-S, --served-in [value]", "Served in", "Mug"],
    ["--no-stirrer", "Do not add stirrer"]
  ],
  action: args => {
    console.log("YOUR ORDER");
    console.log("------------------");

    console.log("args.sugar %s", colors.green(args.sugar));
    console.log("args.decaf %s", colors.green(args.decaf));
    console.log("args.cold %s", colors.green(args.cold));
    console.log("args.servedIn %s", colors.green(args.servedIn));
    console.log("args.stirrer %s", colors.green(args.Do));
  }
};

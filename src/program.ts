import { Command } from "commander";
import { LOG_PREFIX } from "./constants";

const program = new Command();

program
  .name("brakefast")
  .description("A tool to help manage and optimize build performance")
  .version("1.0.0");

program
  .option("-d, --debug", "enable debug output")
  .option("-p, --path <path>", "path to package.json", "./package.json")
  .option("--cache", "enable build caching")
  .option("--parallel", "enable parallel builds")
  .option("--max-concurrency <number>", "maximum number of concurrent builds", "4");

program
  .command("analyze")
  .description("analyze build performance")
  .action(() => {
    console.log(`${LOG_PREFIX} Analyzing build performance...`);
  });

program
  .command("cache")
  .description("manage build cache")
  .option("--clear", "clear the build cache")
  .action((options) => {
    if (options.clear) {
      console.log(`${LOG_PREFIX} Clearing build cache...`);
    } else {
      console.log(`${LOG_PREFIX} Build cache status...`);
    }
  });

program.parse();

export { program };

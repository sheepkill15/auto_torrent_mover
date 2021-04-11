#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import fs from "fs";

const fileRegex = /\] (.+?)((\[)|( \- [0-9]+))/g;

const assertFile = (file: string, folder: string) => {
  if (!file || !folder) {
    console.log("NO");
    return;
  }

  try {
    var name = fileRegex.exec(file)?.[1];
    if (!name) {
      console.log("Regex fail");
      return;
    }
  } catch (e) {
    console.log(e);
    return;
  }

  const dest = path.join(folder, name);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  try {
    const src = path.join(folder, file);
    fs.copyFileSync(src, path.join(dest, file));
    fs.rmSync(src);
    console.log("Moved!");
    console.log(`Source: ${src}\nDest: ${dest}`);
  } catch (e) {
    console.log(e);
  }
};

yargs(hideBin(process.argv))
  .options({
    file: { type: "string", demandOption: true },
    savePath: { type: "string", demandOption: true },
  })
  .command(
    "assert [file] [savePath]",
    "create and put file in matching directory",
    (yargs) => {
      yargs.positional("file", {
        describe: "file to assert",
        type: "string",
        default: "",
      });
      yargs.positional("savePath", {
        describe: "path to file",
        type: "string",
        default: "",
      });
    },
    (argv) => {
      assertFile(argv["file"], argv["savePath"]);
    }
  )
  .showHelpOnFail(true)
  .parse();

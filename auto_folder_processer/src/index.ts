import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

yargs(hideBin(process.argv))
  .options({
    assertScriptLoc: { type: "string", demandOption: true },
    folder: { type: "string", demandOption: true },
    extension: { type: "string", demandOption: false },
  })
  .command(
    "process [assertScriptLoc] [folder] [extension]",
    "processes the specified folder and puts each file in matching directory",
    (yargs) => {
      yargs.positional("folder", {
        describe: "folder to process",
        type: "string",
        default: "",
        alias: "f",
      });
      yargs.positional("assertScriptLoc", {
        describe: "path to script",
        type: "string",
        default: "",
        alias: "p",
      });
      yargs.positional("extension", {
        describe: "extension of files to process",
        type: "string",
        default: "",
        alias: "e",
      });
    },
    (argv) => {
      processFolder(argv["assertScriptLoc"], argv["folder"], argv["extension"]);
    }
  )
  .showHelpOnFail(true)
  .parse();

function processFolder(
  assertScriptLoc: string,
  folderPath: string,
  extension?: string
) {
  if (!fs.existsSync(folderPath)) {
    return;
  }

  const ext = extension || "mkv";
  fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((f) => {
      if (checkFileValidity(f, ext)) {
        console.log("Processing file: ", f.name);
        processFile(assertScriptLoc, folderPath, f.name);
      }
    });
  });
}

function checkFileValidity(file: fs.Dirent, extension: string): boolean {
  return file.isFile() && file.name.endsWith(extension);
}

function processFile(
  assertScriptLoc: string,
  folderPath: string,
  fileName: string
) {
  exec(
    `${assertScriptLoc} assert "${fileName}" "${folderPath}" 1 "Anime"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(stdout);
    }
  );
}

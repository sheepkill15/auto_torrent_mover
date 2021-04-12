import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';
import { Arguments, InferredOptionTypes } from 'yargs';
import { Logger, LogLevel } from './Logger';
import { ConfigLoader } from './ConfigLoader';

const fileRegex = /\] (.+?)((\[)|( \- [0-9]+))/g;

const config = new ConfigLoader();
const logger = new Logger(
  config.get('logFileName') || 'myScript.log',
  LogLevel[config.get('logLevel') as keyof typeof LogLevel] || LogLevel.BOTH
);
config.printConfig(logger);

yargs(hideBin(process.argv))
  .options({
    file: { type: 'string', demandOption: true },
    savePath: { type: 'string', demandOption: true },
    fileCount: { type: 'number', demandOption: false },
    category: { type: 'string', demandOption: false },
  })
  .command(
    'assert [file] [savePath] [fileCount] [category]',
    'create and put file in matching directory',
    (yargs) => {
      yargs.positional('file', {
        describe: 'file to assert',
        type: 'string',
        default: '',
        alias: 'f',
      });
      yargs.positional('savePath', {
        describe: 'path to file',
        type: 'string',
        default: '',
        alias: 's',
      });
      yargs.positional('fileCount', {
        describe: 'number of files to process (currently only 1 is supported)',
        type: 'number',
        default: '',
        alias: 'n',
      });
      yargs.positional('category', {
        describe: 'category of the file',
        type: 'string',
        default: '',
        alias: 'c',
      });
    },
    (argv) => {
      logger.log('Processing file...');
      if (!validateInput(argv)) {
        return;
      }
      logger.log('Passed validation');

      assertFile(argv['file'], argv['savePath']);
    }
  )
  .showHelpOnFail(true)
  .parse();

function assertFile(file: string, folder: string) {
  if (!file || !folder) {
    logger.log('NO');
    return;
  }

  try {
    var name = fileRegex.exec(file)?.[1];
    if (!name) {
      logger.log('Regex fail');
      return;
    }
  } catch (e) {
    logger.log(e);
    return;
  }

  logger.log('Checking destination');
  const dest = path.join(folder, name);
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
    logger.log(`Destination folder created: ${dest}`);
  }

  const src = path.join(folder, file);
  try {
    logger.log('Copying file...');
    fs.copyFileSync(src, path.join(dest, file));
  } catch (e) {
    logger.log(`ERROR: ${e}`);
    logger.log('Exiting...');
    return;
  }

  try {
    logger.log('File copied. Starting removing old file...');
    fs.unlinkSync(src);
    logger.log('Moved!');
    logger.log(`File moved! Source: ${src} - Dest: ${dest}`);
  } catch (e) {
    logger.log(`ERROR: ${e}`);
    tryRemoveFile(src);
  }
}

async function tryRemoveFile(src: string) {
  try {
    const maxAttempts = parseInt(config.get('removeTries'));
    for (let i = 0; i < maxAttempts; i++) {
      logger.log(`Removing old file attempt ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      fs.unlinkSync(src);
      if (!fs.existsSync(src)) {
        logger.log('File removed');
        return;
      }
    }
    logger.log('Failed to remove file');
  } catch (e) {
    logger.log(`ERROR: ${e}`);
  }
}

type ArgvType = Arguments<
  Omit<{}, 'file' | 'savePath' | 'fileCount' | 'category'> &
    InferredOptionTypes<{
      file: {
        type: 'string';
        demandOption: true;
      };
      savePath: {
        type: 'string';
        demandOption: true;
      };
      fileCount: {
        type: 'number';
        demandOption: false;
      };
      category: {
        type: 'string';
        demandOption: false;
      };
    }>
>;

function validateInput(argv: ArgvType): boolean {
  const fileCount = argv['fileCount'];
  if (fileCount && fileCount != 1) {
    logger.log(`Invalid input: fileCount: ${fileCount}`);
    return false;
  }

  const category = argv['category'];
  if (category && category !== (config.get('defaultCategory') || 'Anime')) {
    logger.log(`Invalid input: category: ${category}`);
    return false;
  }

  return true;
}

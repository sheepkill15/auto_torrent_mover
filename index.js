#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const path = require('path');
const fs = require('fs');

const fileRegex = /\] (.+?)((\[)|( \- [0-9]+))/g;

const assertFile = (file, folder) => {
  if(!file || !folder) {
    console.log('NO');
    return;
  }

  try {
    var name = fileRegex.exec(file)[1];
    if(!name) {
      console.log('Regex fail');
      return;
    }
  } catch(e) {
    console.log(e);
    return;
  }
  // mappa == name
    // create
  // copy/mv
  const dest = path.join(folder, name);
  if (!fs.existsSync(dest)){
    fs.mkdirSync(dest);
  }
  
  try {
    const src = path.join(folder, file);
    fs.copyFileSync(src, path.join(dest, file));
    fs.rmSync(src);
    console.log('Moved!');
    console.log(`Source: ${src}\nDest: ${dest}`);
  } catch(e) {
    console.log(e);
  }

}

const argv = yargs(hideBin(process.argv))
        .command('assert [file] [save-path]', 'create and put file in matching directory', (yargs) => {
          yargs.positional('file', {
            describe: 'file to assert',
            type: 'string',
            default: ''
          });
          yargs.positional('save-path', {
            describe: 'path to file',
            type: 'string',
            default: ''
          })
        }, (argv) => {
          assertFile(argv['file'], argv['save-path']);
        }).showHelpOnFail(true)
        .parse();
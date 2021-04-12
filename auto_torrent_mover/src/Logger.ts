import fs from 'fs';
import os from 'os';
import path from 'path';
import process from 'process';

const homedir = os.homedir();

export enum LogLevel {
  CONSOLE,
  FILE,
  BOTH,
}

export class Logger {
  private pid: number;
  private filePath: string;
  private logLevel: LogLevel;

  constructor(fileName: string, logLevel?: LogLevel) {
    this.filePath = path.join(homedir, fileName);
    this.logLevel = logLevel || LogLevel.BOTH;
    this.pid = process.pid;

    fileName && this.createFile();
    this.log(
      `Using file name: '${fileName}' with log level: '${
        LogLevel[this.logLevel]
      }'`
    );
  }

  log(text: string) {
    const timeStamp = new Date().toISOString();
    const formattedText = `[${this.pid}]: ${timeStamp} - ${text}`;
    switch (this.logLevel) {
      case LogLevel.CONSOLE:
        console.log(formattedText);
        break;
      case LogLevel.BOTH:
        console.log(formattedText);
      case LogLevel.FILE:
        this.logToFile(formattedText + '\n');
    }
  }

  private logToFile(text: string) {
    fs.appendFileSync(this.filePath, text);
  }

  private createFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, '');
    }
  }
}

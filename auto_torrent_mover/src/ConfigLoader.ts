import fs from 'fs';
import os from 'os';
import path from 'path';
import { Logger } from './Logger';

const homedir = os.homedir();
const configFileLocation = path.join(homedir, '.myScript.config.json');

const defaultConfigValues = {
  logFileName: 'myScript.log',
  logLevel: 'BOTH',
  defaultCategory: 'Anime',
  removeTries: '3',
};

export type ConfigTypes =
  | 'logFileName'
  | 'logLevel'
  | 'defaultCategory'
  | 'removeTries';

export class ConfigLoader {
  private currentConfig: { [key: string]: string };

  constructor() {
    try {
      const configFile = fs.readFileSync(configFileLocation);
      this.currentConfig = JSON.parse((configFile as unknown) as string);
      this.validateConfig();
    } catch (_err) {
      this.currentConfig = defaultConfigValues;
      this.createConfigFile();
    }
  }

  get(key: ConfigTypes): string {
    return this.currentConfig[key] || '';
  }

  printConfig(logger: Logger) {
    logger.log(
      `Succesfully loaded config: ${JSON.stringify(this.currentConfig)}`
    );
  }

  private createConfigFile() {
    fs.writeFileSync(configFileLocation, JSON.stringify(this.currentConfig));
  }

  private set(key: ConfigTypes, value: string) {
    this.currentConfig[key] = value;
  }

  private validateConfig() {
    let valid = true;
    if (!this.get('logFileName')) {
      this.set('logFileName', defaultConfigValues['logFileName']);
      valid = false;
    }

    if (!this.get('logLevel')) {
      this.set('logLevel', defaultConfigValues['logLevel']);
      valid = false;
    }

    if (!this.get('defaultCategory')) {
      this.set('defaultCategory', defaultConfigValues['defaultCategory']);
      valid = false;
    }

    if (!this.get('removeTries')) {
      this.set('removeTries', defaultConfigValues['removeTries']);
      valid = false;
    }

    if (!valid) {
      this.createConfigFile();
    }
  }
}

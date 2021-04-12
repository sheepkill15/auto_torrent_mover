import fs from "fs";
import os from "os";
import path from "path";
import { Logger } from "./Logger";

const homedir = os.homedir();
const configFileLocation = path.join(homedir, ".myScript.config.json");

export type ConfigTypes = "logFileName" | "logLevel" | "defaultCategory" | "removeTries";

export class ConfigLoader {
  private currentConfig: { [key: string]: string };

  constructor() {
    try {
      const configFile = fs.readFileSync(configFileLocation);
      this.currentConfig = JSON.parse((configFile as unknown) as string);
    } catch (_err) {
      this.currentConfig = {
        logFileName: "myScript.log",
        logLevel: "BOTH",
        defaultCategory: "Anime",
        removeTries: "3"
      };
      this.createConfigFile();
    }
  }

  get(key: ConfigTypes): string {
    return this.currentConfig[key] || "";
  }

  printConfig(logger: Logger) {
    logger.log(
      `Succesfully loaded config: ${JSON.stringify(this.currentConfig)}`
    );
  }

  private createConfigFile() {
    fs.writeFileSync(configFileLocation, JSON.stringify(this.currentConfig));
  }
}

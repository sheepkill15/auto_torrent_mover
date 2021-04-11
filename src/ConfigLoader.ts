import fs from "fs";
import os from "os";
import path from "path";
import { Logger } from "./Logger";

const homedir = os.homedir();
const configFileLocation = path.join(homedir, ".myScript.config.json");

export type ConfigTypes = "logFileName" | "logLevel" | "defaultCategory";

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
      };
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
}

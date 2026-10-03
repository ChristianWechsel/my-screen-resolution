import type { Logger } from "@christian-wechsel/logger";
import { ConsoleLogger, FileLogger } from "@christian-wechsel/logger";
import { resolve } from "path";
import { createEnv } from "./core/env.js";

export const env = createEnv();
const NODE_ENV = env.getValue("NODE_ENV");
export const logger: Logger =
  NODE_ENV === "production"
    ? new FileLogger(
        env.getValue("APP_NAME"),
        {
          pathFolder: resolve(process.cwd(), "logs"),
          extension: "jsonl",
        },
        "json",
      )
    : new ConsoleLogger(env.getValue("APP_NAME"));

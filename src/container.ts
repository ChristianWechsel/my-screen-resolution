import type { Logger } from "@christian-wechsel/logger";
import { ConsoleLogger } from "@christian-wechsel/logger";
import { createEnv } from "./core/env.js";

export const env = createEnv();
export const logger: Logger = new ConsoleLogger(env.getValue("APP_NAME"));

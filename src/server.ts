import type { Logger } from "@christian-wechsel/logger";
import express from "express";
import helmet from "helmet";
import type { SecretManager } from "./core/secrets.js";
import type { Database } from "./database/db.js";
import { createRequestLogger } from "./middleware/request-logger.js";
import { createHelloWorldRouter } from "./routes/hello-world.js";
import type { Storage } from "./storage/storage.js";

interface AppEnvProvider {
  getValue(key: "NODE_ENV"): string;
  getValue(key: "GOOGLE_CLIENT_ID"): string;
  getValue(key: "GOOGLE_PROJECT_ID"): string;
  getValue(key: "ADMIN_EMAIL"): string;
}

export async function createApp(
  env: AppEnvProvider,
  secretManager: SecretManager,
  logger: Logger,
  db: Database,
  storage: Storage,
): Promise<express.Express> {
  const app = express();
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "connect-src": ["'self'", "https://storage.googleapis.com"],
          "img-src": ["'self'", "https://storage.googleapis.com"],
        },
      },
    }),
  );
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static("public"));
  app.use(createRequestLogger(logger));

  await db.connect();
  logger.info("Database connected", createApp.name);

  app.use("/api/hello-world", createHelloWorldRouter(db, storage, logger));
  app.use("/hello-world", createHelloWorldRouter(db, storage, logger));

  return app;
}

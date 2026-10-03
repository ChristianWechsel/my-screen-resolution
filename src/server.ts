import type { Logger } from "@christian-wechsel/logger";
import express from "express";
import helmet from "helmet";
import type { Database } from "./database/db.js";
import { createRequestLogger } from "./middleware/request-logger.js";
import { createHelloWorldRouter } from "./routes/hello-world.js";

export async function createApp(
  logger: Logger,
  db: Database,
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
  app.use(createRequestLogger(logger));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static("public"));

  await db.connect();
  logger.info("Database connected", createApp.name);

  app.use("/hello-world", createHelloWorldRouter(db, logger));

  return app;
}

import { db, env, logger, storage } from "./container.js";
import { createApp } from "./server.js";

if (env.getValue("NODE_ENV") !== "production") {
  logger.warn("!!!Auth is deactivated in non-production mode.!!!");
}

const app = await createApp(logger, db, storage);

const port = env.getValue("PORT");
const server = app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});

import { db, env, logger } from "./container.js";
import { createApp } from "./server.js";

createApp(logger, db).then((app) => {
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
});

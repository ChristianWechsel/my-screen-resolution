import type { Logger } from "@christian-wechsel/logger";
import type { Request, Response } from "express";
import { Router } from "express";
import type { Database } from "../database/db.js";

export function createHelloWorldRouter(db: Database, logger: Logger): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    try {
      const record = await db.getHelloWorld();
      res.json(record);
    } catch (error) {
      logger.error("Error fetching hello world", createHelloWorldRouter.name);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}

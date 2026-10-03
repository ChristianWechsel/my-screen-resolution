import type { Logger } from "@christian-wechsel/logger";
import type { Request, Response } from "express";
import { Router } from "express";
import type { Database } from "../database/db.js";
import type { Storage } from "../storage/storage.js";

export function createHelloWorldRouter(
  db: Database,
  storage: Storage,
  logger: Logger,
): Router {
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

  router.post("/", async (req: Request, res: Response) => {
    try {
      const message =
        typeof req.body?.message === "string"
          ? req.body.message
          : "Hello World";
      const createdBy =
        typeof req.body?.createdBy === "string" ? req.body.createdBy : "system";
      const record = await db.setHelloWorld(message, createdBy);
      res.json(record);
    } catch (error) {
      logger.error("Error saving hello world", createHelloWorldRouter.name);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post("/files/upload", async (req: Request, res: Response) => {
    try {
      const fileName =
        typeof req.body?.fileName === "string"
          ? req.body.fileName
          : "hello-world.txt";
      const content =
        typeof req.body?.content === "string"
          ? req.body.content
          : "Hello World from File!";

      await storage.uploadFile(fileName, content);
      const downloadUrl = await storage.getDownloadUrl(fileName);
      res.json({
        message: "File uploaded successfully",
        fileName,
        downloadUrl,
      });
    } catch (error) {
      logger.error("Error uploading file", createHelloWorldRouter.name);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  router.get(
    "/files/download/:fileName",
    async (req: Request, res: Response) => {
      try {
        const fileName = req.params["fileName"] ?? "hello-world.txt";
        const fileBuffer = await storage.downloadFile(fileName);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`,
        );
        res.setHeader("Content-Type", "application/octet-stream");
        res.send(fileBuffer);
      } catch (error) {
        logger.error("Error downloading file", createHelloWorldRouter.name);
        res.status(404).json({ error: "File not found" });
      }
    },
  );

  router.get(
    "/files/upload-url/:fileName",
    async (req: Request, res: Response) => {
      try {
        const fileName = req.params["fileName"] ?? "hello-world.txt";
        const uploadUrl = await storage.getUploadUrl(fileName);
        res.json({ fileName, uploadUrl });
      } catch (error) {
        logger.error("Error getting upload URL", createHelloWorldRouter.name);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  router.get(
    "/files/download-url/:fileName",
    async (req: Request, res: Response) => {
      try {
        const fileName = req.params["fileName"] ?? "hello-world.txt";
        const downloadUrl = await storage.getDownloadUrl(fileName);
        res.json({ fileName, downloadUrl });
      } catch (error) {
        logger.error("Error getting download URL", createHelloWorldRouter.name);
        res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  return router;
}

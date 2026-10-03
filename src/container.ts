import type { Logger } from "@christian-wechsel/logger";
import { ConsoleLogger } from "@christian-wechsel/logger";
import { Firestore } from "@google-cloud/firestore";
import { createEnv } from "./core/env.js";
import { SecretManager } from "./core/secrets.js";
import { FirebaseDatabase } from "./database/firebase.js";
import { GoogleCloudStorage } from "./storage/google-cloud-storage.js";

export const env = createEnv();
export const secretManager = new SecretManager(env);
export const logger: Logger = new ConsoleLogger(env.getValue("APP_NAME"));

const firestoreClient = new Firestore({
  projectId: env.getValue("GOOGLE_PROJECT_ID"),
});

export const db = new FirebaseDatabase(firestoreClient, logger);

export const storage = new GoogleCloudStorage(
  env.getValue("GOOGLE_PROJECT_ID"),
  env.getValue("BUCKET_NAME"),
  logger,
);

import type { Logger } from "@christian-wechsel/logger";
import { ConsoleLogger } from "@christian-wechsel/logger";
import { Firestore } from "@google-cloud/firestore";
import { createEnv } from "./core/env.js";
import { SecretManager } from "./core/secrets.js";
import { FirebaseDatabase } from "./database/firebase.js";
import { InMemoryDatabase } from "./database/in-memory-db.js";
import { FirestoreSessionAdapter } from "./database/session-store/firestore-session-adapter.js";
import { InMemorySessionAdapter } from "./database/session-store/in-memory-session-adapter.js";
import { SessionStore } from "./database/session-store/session-store.js";
import { GoogleCloudStorage } from "./storage/google-cloud-storage.js";
import { InMemoryStorage } from "./storage/in-memory-storage.js";

export const env = createEnv();
const isProduction = env.getValue("NODE_ENV") === "production";
export const secretManager = new SecretManager(env);
export const logger: Logger = new ConsoleLogger(env.getValue("APP_NAME"));

const firestoreClient = isProduction
  ? new Firestore({ projectId: env.getValue("GOOGLE_PROJECT_ID") })
  : undefined;

export const db =
  isProduction && firestoreClient
    ? new FirebaseDatabase(firestoreClient, logger)
    : new InMemoryDatabase(logger);

export const storage = isProduction
  ? new GoogleCloudStorage(
      env.getValue("GOOGLE_PROJECT_ID"),
      env.getValue("BUCKET_NAME"),
      logger,
    )
  : new InMemoryStorage(
      logger,
      `http://localhost:${env.getValue("PORT")}/storage-dev`,
    );

const sessionStoreAdapter =
  isProduction && firestoreClient
    ? new FirestoreSessionAdapter(firestoreClient)
    : new InMemorySessionAdapter();

export const sessionStore = new SessionStore(sessionStoreAdapter, logger);

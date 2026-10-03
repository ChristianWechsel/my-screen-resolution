import type { Logger } from "@christian-wechsel/logger";
import { Firestore } from "@google-cloud/firestore";
import {
  createDatabaseRecord,
  type DatabaseRecord,
} from "../types/database.js";
import type { Database, HelloWorldData, HelloWorldRecord } from "./db.js";

// https://docs.cloud.google.com/firestore/native/docs/overview?hl=de
export class FirebaseDatabase implements Database {
  constructor(
    private readonly db: Firestore,
    private readonly logger: Logger,
  ) {}

  connect(): Promise<void> {
    this.log("info", "Firestore connection established");
    return Promise.resolve();
  }

  async getHelloWorld(): Promise<HelloWorldRecord> {
    this.log("debug", "Fetching hello world message from Firestore");
    const doc = await this.getRefHelloWorldCollection().doc("default").get();

    if (!doc.exists) {
      return createDatabaseRecord(
        { message: "Hello World" },
        { id: "default", createdBy: "system" },
      );
    }

    const data = doc.data();
    return (
      data ??
      createDatabaseRecord(
        { message: "Hello World" },
        { id: "default", createdBy: "system" },
      )
    );
  }

  async setHelloWorld(
    message: string,
    createdBy = "system",
  ): Promise<HelloWorldRecord> {
    this.log("info", `Setting hello world message: ${message}`);
    const record = createDatabaseRecord(
      { message },
      { id: "default", createdBy, updatedAt: new Date() },
    );
    await this.getRefHelloWorldCollection().doc("default").set(record);
    return record;
  }

  private getRefHelloWorldCollection() {
    return this.getConnection()
      .collection("hello-world")
      .withConverter({
        toFirestore: (record: DatabaseRecord<HelloWorldData>) => record,
        fromFirestore: (snapshot): DatabaseRecord<HelloWorldData> => {
          const data = snapshot.data();
          return {
            id: snapshot.id,
            message: data?.["message"] ?? "Hello World",
            createdBy: data?.["createdBy"] ?? "system",
            createdAt: data?.["createdAt"]
              ? data["createdAt"].toDate()
              : new Date(),
            ...(data?.["updatedAt"]
              ? { updatedAt: data["updatedAt"].toDate() }
              : {}),
          };
        },
      });
  }

  private log(level: keyof Logger, message: string): void {
    this.logger[level](message, this.constructor.name);
  }

  private getConnection() {
    return this.db;
  }
}

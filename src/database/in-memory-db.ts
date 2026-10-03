import type { Logger } from "@christian-wechsel/logger";
import { createDatabaseRecord } from "../types/database.js";
import type { Database, HelloWorldRecord } from "./db.js";

export class InMemoryDatabase implements Database {
  private record: HelloWorldRecord = createDatabaseRecord(
    { message: "Hello World" },
    { id: "default", createdBy: "system" },
  );

  constructor(private readonly logger: Logger) {
    this.log("debug", "InMemoryDatabase initialized");
  }

  connect(): Promise<void> {
    this.log("debug", "InMemoryDatabase connected");
    return Promise.resolve();
  }

  getHelloWorld(): Promise<HelloWorldRecord> {
    this.log(
      "debug",
      `Fetching hello world record: ${JSON.stringify(this.record)}`,
    );
    return Promise.resolve(this.record);
  }

  setHelloWorld(
    message: string,
    createdBy = "system",
  ): Promise<HelloWorldRecord> {
    this.log("info", `Setting hello world message: ${message}`);
    this.record = createDatabaseRecord(
      { message },
      { id: "default", createdBy, updatedAt: new Date() },
    );
    return Promise.resolve(this.record);
  }

  private log(level: keyof Logger, message: string): void {
    this.logger[level](message, this.constructor.name);
  }
}

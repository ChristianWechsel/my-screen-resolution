import type { DatabaseRecord } from "../types/database.js";

export type HelloWorldData = {
  message: string;
};

export type HelloWorldRecord = DatabaseRecord<HelloWorldData>;

export interface Database {
  connect(): Promise<void>;
  getHelloWorld(): Promise<HelloWorldRecord>;
  setHelloWorld(message: string, createdBy?: string): Promise<HelloWorldRecord>;
}

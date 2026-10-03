import type { Logger } from "@christian-wechsel/logger";
import type { Storage } from "./storage.js";

export class InMemoryStorage implements Storage {
  private files = new Map<string, Buffer>();

  constructor(
    private readonly logger: Logger,
    private baseURL: string,
  ) {
    this.log("debug", `InMemoryStorage initialized`);
  }

  async getUploadUrl(
    fileName: string,
    _contentType = "application/octet-stream",
  ): Promise<string> {
    const encodedFileName = this.encodeFileName(fileName);
    const url = `${this.baseURL}/upload/${encodedFileName}`;
    this.log("debug", `Generated upload URL for ${encodedFileName}: ${url}`);
    return url;
  }

  async getDownloadUrl(fileName: string): Promise<string> {
    const encodedFileName = this.encodeFileName(fileName);
    const url = `${this.baseURL}/download/${encodedFileName}`;
    this.log("debug", `Generated download URL for ${encodedFileName}: ${url}`);
    return url;
  }

  async uploadFile(fileName: string, content: Buffer | string): Promise<void> {
    this.log("debug", `Uploading file: ${fileName}`);
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    this.files.set(fileName, buffer);
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    this.log("debug", `Downloading file: ${fileName}`);
    const file = this.files.get(fileName);
    if (!file) {
      throw new Error(`File ${fileName} not found`);
    }
    return file;
  }

  private log(level: keyof Logger, message: string): void {
    this.logger[level](message, this.constructor.name);
  }

  private encodeFileName(fileName: string): string {
    return encodeURIComponent(fileName);
  }
}

import type { Logger } from "@christian-wechsel/logger";
import { Storage as GCSStorage } from "@google-cloud/storage";
import type { Storage } from "./storage.js";

const SIGNED_URL_TTL_MS = 5 * 60 * 1000;

export class GoogleCloudStorage implements Storage {
  private gcs: GCSStorage;

  constructor(
    private readonly projectId: string,
    private readonly bucketName: string,
    private readonly logger: Logger,
  ) {
    this.gcs = new GCSStorage({ projectId: this.projectId });
    this.log(
      "info",
      `Google Cloud Storage initialized with projectId: ${this.projectId}, bucketName: ${this.bucketName}`,
    );
  }

  async getUploadUrl(
    fileName: string,
    contentType = "application/octet-stream",
  ): Promise<string> {
    this.log(
      "debug",
      `Generating upload URL for ${fileName} with content type ${contentType}`,
    );
    const encodedFileName = this.encodeFileName(fileName);
    const [url] = await this.gcs
      .bucket(this.bucketName)
      .file(encodedFileName)
      .getSignedUrl({
        version: "v4",
        expires: this.calculateExpires(),
        action: "write",
        contentType,
      });
    this.log("debug", `Generated upload URL for ${encodedFileName}: ${url}`);
    return url;
  }

  async getDownloadUrl(fileName: string): Promise<string> {
    this.log("debug", `Generating download URL for ${fileName}`);
    const encodedFileName = this.encodeFileName(fileName);
    const [url] = await this.gcs
      .bucket(this.bucketName)
      .file(encodedFileName)
      .getSignedUrl({
        version: "v4",
        expires: this.calculateExpires(),
        action: "read",
      });
    return url;
  }

  async uploadFile(fileName: string, content: Buffer | string): Promise<void> {
    this.log("debug", `Uploading file to GCS: ${fileName}`);
    const encodedFileName = this.encodeFileName(fileName);
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    await this.gcs.bucket(this.bucketName).file(encodedFileName).save(buffer);
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    this.log("debug", `Downloading file from GCS: ${fileName}`);
    const encodedFileName = this.encodeFileName(fileName);
    const [content] = await this.gcs
      .bucket(this.bucketName)
      .file(encodedFileName)
      .download();
    return content;
  }

  // Muss bei jedem Aufruf frisch berechnet werden, da GoogleCloudStorage als Singleton lebt.
  private calculateExpires(): number {
    return Date.now() + SIGNED_URL_TTL_MS;
  }

  private log(level: keyof Logger, message: string): void {
    this.logger[level](message, this.constructor.name);
  }

  private encodeFileName(fileName: string): string {
    return encodeURIComponent(fileName);
  }
}

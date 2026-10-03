export interface Storage {
  getUploadUrl(fileName: string, contentType?: string): Promise<string>;
  getDownloadUrl(fileName: string): Promise<string>;
  uploadFile(fileName: string, content: Buffer | string): Promise<void>;
  downloadFile(fileName: string): Promise<Buffer>;
}

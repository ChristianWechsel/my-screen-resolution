export type DatabaseRecord<T> = T & {
  id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
};

export function createDatabaseRecord<T>(
  data: T,
  options?: {
    id?: string;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
  },
): DatabaseRecord<T> {
  const now = new Date();
  return {
    ...data,
    id: options?.id ?? "default",
    createdAt: options?.createdAt ?? now,
    createdBy: options?.createdBy ?? "system",
    ...(options?.updatedAt ? { updatedAt: options.updatedAt } : {}),
  };
}

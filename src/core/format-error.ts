// JSON.stringify(error) yields "{}" for Error instances, since message/stack aren't enumerable.
export function formatError(error: unknown): string {
  return error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error);
}

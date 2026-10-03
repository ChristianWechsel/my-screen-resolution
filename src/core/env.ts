import { HandleEnv } from "@christian-wechsel/typed-env-handler";

export function createEnv() {
  return new HandleEnv<{
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    IS_DOCKER: boolean;
    APP_NAME: string;
    GOOGLE_PROJECT_ID: string;
    BUCKET_NAME: string;
  }>(
    {
      NODE_ENV: {
        defaultValue: "development",
        conversion(value) {
          return value as "development" | "production" | "test";
        },
        validation(value) {
          return (["development", "production", "test"] as const).includes(
            value,
          );
        },
      },
      PORT: HandleEnv.number({ defaultValue: 80 }),
      IS_DOCKER: HandleEnv.boolean({ defaultValue: false }),
      APP_NAME: HandleEnv.string({ defaultValue: "app" }),
      GOOGLE_PROJECT_ID: HandleEnv.string(),
      BUCKET_NAME: HandleEnv.string(),
    },
    { debugLogs: true, docker: { pathSecrets: "/run/secrets" } },
  );
}

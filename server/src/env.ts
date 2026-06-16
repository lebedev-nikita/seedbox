import path from "node:path";
import { z } from "zod";

export const env = getEnv();

function getEnv() {
  const EnvSchema = z.object({
    NODE_ENV: z.enum(["production", "development"]),
    SEEDBOX_ALLOWED_DOWNLOAD_DIRS: z
      .string()
      .transform((str) => str.split(",").map((dir) => path.resolve(dir)))
      .pipe(z.array(z.string().trim().min(1)).min(1)),
  });

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error(JSON.stringify(result.error.issues, null, 2));
    process.exit(1);
  }

  return result.data;
}

import { fileURLToPath, SQL } from "bun";
import z from "zod";

const dbPath = fileURLToPath(import.meta.resolve("../../../db/data.sqlite"));
const sql = new SQL({ adapter: "sqlite", filename: dbPath, create: true });

await sql`
  CREATE TABLE IF NOT EXISTS app_setting (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`;

const SettingSchema = z.object({
  value: z.string(),
});

export async function getSetting(key: string) {
  const rows = await sql`
    SELECT value
    FROM app_setting
    WHERE key = ${key}
    LIMIT 1
  `;

  const parsed = z.array(SettingSchema).parse(rows);
  return parsed[0]?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await sql`
    INSERT INTO app_setting (key, value)
    VALUES (${key}, ${value})
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `;
}

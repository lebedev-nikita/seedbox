import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./api";

const frontendDir = fileURLToPath(import.meta.resolve("../../client/dist"));

const app = new Hono().route("/api", apiRouter).use("/*", serveStatic({ root: frontendDir }));

export default app;

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { torrentsRouter } from "./torrents";
import { appRouter } from "./trpc";

export const apiRouter = new Hono()
  .all("/trpc/*", (c) =>
    fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
    }),
  )
  .route("/torrents", torrentsRouter)
  .get("/health", (c) => c.json({ ok: true }));

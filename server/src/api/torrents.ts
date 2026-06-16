import { match } from "@lebedevna/match";
import { Hono, type Context } from "hono";
import { stat } from "node:fs/promises";
import path from "node:path";
import z from "zod";
import { assertAllowedDownloadDir, resolveTorrentFilePath } from "../sensors/storage";
import { addTorrentMetainfo, getTorrentWithFiles } from "../sensors/transmission";

export const torrentsRouter = new Hono()
  .post("/api/torrents/upload", async (c) => {
    try {
      const body = await c.req.parseBody();
      const torrentFile = body.file;
      const downloadDir = body.downloadDir;

      if (!(torrentFile instanceof File)) {
        return c.json({ error: "Expected multipart field named file" }, 400);
      }

      if (typeof downloadDir === "string" && downloadDir.length > 0) {
        assertAllowedDownloadDir(downloadDir);
      }

      const bytes = await torrentFile.arrayBuffer();
      const metainfo = Buffer.from(bytes).toString("base64");
      await addTorrentMetainfo(
        metainfo,
        typeof downloadDir === "string" && downloadDir.length > 0 ? downloadDir : null,
      );

      return c.json({ ok: true });
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Failed to upload torrent" },
        500,
      );
    }
  })
  .get("/api/torrents/:torrentId/files/:fileIndex/download", async (c) => {
    return serveTorrentFile(c, "attachment");
  })
  .get("/api/torrents/:torrentId/files/:fileIndex/stream", async (c) => {
    return serveTorrentFile(c, "inline");
  });

async function serveTorrentFile(c: Context, disposition: "attachment" | "inline") {
  try {
    const torrentId = z.coerce.number().int().min(1).safeParse(c.req.param("torrentId"));
    const fileIndex = z.coerce.number().int().min(0).safeParse(c.req.param("fileIndex"));

    if (!torrentId.success) {
      return c.json({ error: "Invalid torrent id" }, 400);
    }
    if (!fileIndex.success) {
      return c.json({ error: "Invalid file index" }, 400);
    }

    const torrent = await getTorrentWithFiles(torrentId.data);
    const file = torrent.files?.[fileIndex.data];

    if (!file) {
      return c.json({ error: "File not found" }, 404);
    }

    const filePath = resolveTorrentFilePath(torrent.downloadDir, file.name);
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      return c.json({ error: "Path is not a file" }, 404);
    }

    const range = parseRange(c.req.header("range"), fileStats.size);
    const headers = new Headers();
    const contentType = getContentType(file.name);
    const filename = path.basename(file.name).replaceAll('"', "");

    headers.set("accept-ranges", "bytes");
    headers.set("content-type", contentType);
    headers.set("content-disposition", `${disposition}; filename="${filename}"`);

    if (range) {
      const { start, end } = range;
      headers.set("content-range", `bytes ${start}-${end}/${fileStats.size}`);
      headers.set("content-length", String(end - start + 1));
      return new Response(Bun.file(filePath).slice(start, end + 1), {
        status: 206,
        headers,
      });
    }

    headers.set("content-length", String(fileStats.size));
    return new Response(Bun.file(filePath), { headers });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Failed to serve file" }, 500);
  }
}

function parseRange(rangeHeader: string | undefined, size: number) {
  if (!rangeHeader) {
    return null;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) {
    return null;
  }

  const startText = match[1];
  const endText = match[2];
  let start = startText ? Number(startText) : 0;
  let end = endText ? Number(endText) : size - 1;

  if (!startText && endText) {
    const suffixLength = Number(endText);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  }

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return null;
  }

  return { start, end: Math.min(end, size - 1) };
}

function getContentType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  return (
    match(extension, {
      ".mp4": "video/mp4",
      ".m4v": "video/x-m4v",
      ".webm": "video/webm",
      ".mkv": "video/x-matroska",
      ".mov": "video/quicktime",
      ".mp3": "audio/mpeg",
      ".m4a": "audio/mp4",
      ".ogg": "audio/ogg",
      ".wav": "audio/wav",
      ".flac": "audio/flac",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }) ?? "application/octet-stream"
  );
}

import path from "node:path";
import { env } from "../env";
import { getSetting, setSetting } from "./db";

const DOWNLOAD_DIR_KEY = "downloadDir";

export function assertAllowedDownloadDir(downloadDir: string) {
  const resolved = path.resolve(downloadDir);

  if (!env.SEEDBOX_ALLOWED_DOWNLOAD_DIRS.includes(resolved)) {
    throw new Error("Download directory is not in SEEDBOX_ALLOWED_DOWNLOAD_DIRS");
  }

  return resolved;
}

export async function getActiveDownloadDir() {
  const allowedDirs = env.SEEDBOX_ALLOWED_DOWNLOAD_DIRS;
  const savedDir = await getSetting(DOWNLOAD_DIR_KEY);

  if (savedDir && allowedDirs.includes(path.resolve(savedDir))) {
    return path.resolve(savedDir);
  }

  return allowedDirs[0] ?? null;
}

export async function setActiveDownloadDir(downloadDir: string) {
  const resolved = assertAllowedDownloadDir(downloadDir);
  await setSetting(DOWNLOAD_DIR_KEY, resolved);
  return resolved;
}

export function resolveTorrentFilePath(downloadDir: string, torrentFilePath: string) {
  const resolvedDownloadDir = path.resolve(downloadDir);
  const resolvedFilePath = path.resolve(resolvedDownloadDir, torrentFilePath);
  const relative = path.relative(resolvedDownloadDir, resolvedFilePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Torrent file path escapes the download directory");
  }

  return resolvedFilePath;
}

import { match } from "@lebedevna/match";
import type { Torrent } from "../types";

export function formatStatus(torrent: Torrent) {
  return match(torrent.status, {
    "stopped": "остановлен",
    "check-wait": "ожидает проверки",
    "checking": "проверка",
    "download-wait": "ожидает загрузки",
    "downloading": "загрузка",
    "seed-wait": "ожидает раздачи",
    "seeding": "раздача",
    "unknown": "неизвестно",
  });
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatRatio(value: number) {
  if (value < 0 || !Number.isFinite(value)) {
    return "-";
  }
  return value.toFixed(2);
}

export function formatBytes(value: number) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

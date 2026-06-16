const mediaExtensions = new Set([
  "mp4",
  "m4v",
  "webm",
  "mkv",
  "mov",
  "mp3",
  "m4a",
  "ogg",
  "wav",
  "flac",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
]);

export function isPreviewable(fileName: string) {
  return mediaExtensions.has(getExtension(fileName));
}

export function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

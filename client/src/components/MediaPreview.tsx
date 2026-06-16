import type { TorrentFile } from "../types";
import { getExtension } from "../utils/media";
import { Button } from "./ui/Button";

export function MediaPreview({
  torrentId,
  file,
  onClose,
}: {
  torrentId: number;
  file: TorrentFile;
  onClose: () => void;
}) {
  const src = `/api/torrents/${torrentId}/files/${file.index}/stream`;
  const extension = getExtension(file.name);

  return (
    <div className="grid gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <strong className="min-w-0 wrap-anywhere text-slate-950">{file.name}</strong>
        <Button type="button" onClick={onClose}>
          Закрыть
        </Button>
      </div>
      {["jpg", "jpeg", "png", "gif", "webp"].includes(extension) ?
        <img className="max-h-[420px] w-full rounded-md bg-slate-950" src={src} alt={file.name} />
      : ["mp3", "m4a", "ogg", "wav", "flac"].includes(extension) ?
        <audio className="w-full" src={src} controls />
      : <video className="max-h-[420px] w-full rounded-md bg-slate-950" src={src} controls />}
    </div>
  );
}

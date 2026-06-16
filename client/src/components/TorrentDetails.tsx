import { useMemo, useState } from "react";
import { trpc } from "../trpc";
import type { Torrent, TorrentFile } from "../types";
import { buildFileTree } from "../utils/fileTree";
import { formatBytes } from "../utils/format";
import { FileNode } from "./FileNode";
import { MediaPreview } from "./MediaPreview";
import Panel from "./ui/Panel";

export function TorrentDetails({ torrent }: { torrent: Torrent | null }) {
  const [previewFile, setPreviewFile] = useState<TorrentFile | null>(null);
  const files = trpc.torrents.files.useQuery(
    { id: torrent?.id ?? 0 },
    { enabled: Boolean(torrent) },
  );

  const tree = useMemo(() => buildFileTree(files.data?.files ?? []), [files.data?.files]);

  if (!torrent) {
    return (
      <Panel className="grid min-h-56 place-items-center text-slate-500">Выберите раздачу</Panel>
    );
  }

  return (
    <Panel className="grid gap-3.5 p-4" aria-label="Файлы раздачи">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base leading-tight font-semibold wrap-anywhere text-slate-950">
            {torrent.name}
          </h2>
          <p className="mt-1 wrap-anywhere text-slate-500">{torrent.downloadDir}</p>
        </div>
        <span className="shrink-0 text-slate-500">
          {formatBytes(torrent.leftUntilDone)} осталось
        </span>
      </div>

      {previewFile && (
        <MediaPreview
          torrentId={torrent.id}
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {files.isLoading && <p className="text-slate-500">Загрузка файлов...</p>}
      {files.error && <p className="text-red-700">{files.error.message}</p>}
      <div className="grid gap-1.5">
        {tree.map((node) => (
          <FileNode key={node.path} node={node} torrentId={torrent.id} onPreview={setPreviewFile} />
        ))}
      </div>
    </Panel>
  );
}

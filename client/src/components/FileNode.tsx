import { buttonClass } from "../styles";
import type { TorrentFile } from "../types";
import type { FileTreeNode } from "../utils/fileTree";
import { formatBytes, formatPercent } from "../utils/format";
import { isPreviewable } from "../utils/media";

export function FileNode({
  node,
  torrentId,
  onPreview,
}: {
  node: FileTreeNode;
  torrentId: number;
  onPreview: (file: TorrentFile) => void;
}) {
  if (!node.file) {
    return (
      <details className="rounded-md border border-slate-200 bg-white" open>
        <summary className="min-h-9 cursor-pointer px-2.5 py-2 text-slate-800">{node.name}</summary>
        <div className="grid gap-1.5 px-2 pb-2 pl-4">
          {node.children.map((child) => (
            <FileNode key={child.path} node={child} torrentId={torrentId} onPreview={onPreview} />
          ))}
        </div>
      </details>
    );
  }

  const file = node.file;
  const downloadUrl = `/api/torrents/${torrentId}/files/${file.index}/download`;
  const streamUrl = `/api/torrents/${torrentId}/files/${file.index}/stream`;

  return (
    <div className="flex min-h-12 flex-col gap-3 rounded-md border border-slate-200 bg-white px-2.5 py-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <strong className="block wrap-anywhere text-slate-950">{node.name}</strong>
        <span className="text-sm text-slate-500">
          {formatBytes(file.bytesCompleted)} / {formatBytes(file.length)} ·{" "}
          {formatPercent(file.percentDone)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isPreviewable(file.name) && (
          <>
            <button className={buttonClass} type="button" onClick={() => onPreview(file)}>
              Открыть
            </button>
            <a className={buttonClass} href={streamUrl} target="_blank" rel="noreferrer">
              В новой вкладке
            </a>
          </>
        )}
        <a className={buttonClass} href={downloadUrl}>
          Скачать
        </a>
      </div>
    </div>
  );
}

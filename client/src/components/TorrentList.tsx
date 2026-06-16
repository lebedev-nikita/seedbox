import { usePauseM, useRemoveM, useResumeM } from "../hooks/api";
import type { Torrent } from "../types";
import {
  formatBytes,
  formatDuration,
  formatPercent,
  formatRatio,
  formatStatus,
} from "../utils/format";
import { Button } from "./ui/Button";
import Panel from "./ui/Panel";

export function TorrentList({
  torrents,
  isLoading,
  selectedTorrentId,
  ...props
}: {
  torrents: Torrent[];
  isLoading: boolean;
  selectedTorrentId: number | null;
  onSelect(id: number | null): void;
}) {
  const pauseM = usePauseM();
  const resumeM = useResumeM();
  const removeM = useRemoveM();

  const busyTorrentId =
    (pauseM.isPending && pauseM.variables?.id) ||
    (resumeM.isPending && resumeM.variables?.id) ||
    (removeM.isPending && removeM.variables?.id) ||
    null;

  if (isLoading) {
    return <Panel className="p-4">Загрузка раздач...</Panel>;
  }

  if (torrents.length === 0) {
    return (
      <Panel className="grid min-h-56 place-items-center text-slate-500">Раздач пока нет</Panel>
    );
  }

  return (
    <Panel className="overflow-hidden" aria-label="Раздачи">
      {torrents.map((torrent) => {
        const isSelected = torrent.id === selectedTorrentId;
        const canPause = torrent.status != "stopped";
        const isBusy = busyTorrentId === torrent.id;

        return (
          <article
            key={torrent.id}
            className={`grid cursor-pointer gap-2.5 border-b border-slate-200 p-3.5 last:border-b-0 ${
              isSelected ? "bg-teal-50" : "bg-white"
            }`}
            onClick={() => props.onSelect(torrent.id)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base leading-tight font-semibold wrap-anywhere text-slate-950">
                  {torrent.name}
                </h2>
                <div className="mt-1 flex flex-wrap gap-2.5 text-sm text-slate-500">
                  <span>{formatStatus(torrent)}</span>
                  <span>{formatBytes(torrent.totalSize)}</span>
                  <span>ratio {formatRatio(torrent.uploadRatio)}</span>
                </div>
              </div>
              <strong className="shrink-0">{formatPercent(torrent.percentDone)}</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-label="Прогресс">
              <span
                className="block h-full min-w-0.5 bg-teal-700"
                style={{ width: `${Math.round(torrent.percentDone * 100)}%` }}
              />
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2.5">
                <span>↓ {formatBytes(torrent.rateDownload)}/s</span>
                <span>↑ {formatBytes(torrent.rateUpload)}/s</span>
                <span>{torrent.eta ? `ETA ${formatDuration(torrent.eta)}` : "ETA -"}</span>
              </div>
              <div
                className="flex flex-wrap items-center gap-2"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={() =>
                    canPause ?
                      pauseM.mutate({ id: torrent.id })
                    : resumeM.mutate({ id: torrent.id })
                  }
                >
                  {canPause ? "Пауза" : "Старт"}
                </Button>
                <Button
                  variant="danger"
                  type="button"
                  disabled={isBusy}
                  onClick={async () => {
                    await removeM.mutateAsync({ id: torrent.id, deleteLocalData: false });
                    props.onSelect(null);
                  }}
                >
                  Убрать
                </Button>
                <Button
                  variant="danger"
                  type="button"
                  disabled={isBusy}
                  onClick={async () => {
                    if (confirm("Удалить раздачу вместе с файлами?")) {
                      await removeM.mutateAsync({ id: torrent.id, deleteLocalData: true });
                      props.onSelect(null);
                    }
                  }}
                >
                  Удалить файлы
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </Panel>
  );
}

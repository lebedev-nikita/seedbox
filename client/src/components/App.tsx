import { useState } from "react";
import {
  useSetDownloadDirM,
  useStorageSettings,
  useTorrents,
  useTransmissionStatus,
  useUploadTorrentM,
} from "../hooks/api";
import { trpc } from "../trpc";
import { StatusMessage } from "./StatusMessage";
import { StorageSelector } from "./StorageSelector";
import { TorrentDetails } from "./TorrentDetails";
import { TorrentList } from "./TorrentList";
import { TransmissionStatus } from "./TransmissionStatus";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function App() {
  const utils = trpc.useUtils();
  const storage = useStorageSettings();
  const torrents = useTorrents();
  const transmissionStatus = useTransmissionStatus();
  const [selectedTorrentId, setSelectedTorrentId] = useState<number | null>(null);
  const [magnet, setMagnet] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const activeDownloadDir = storage.data?.activeDownloadDir ?? "";

  const addMagnetM = trpc.torrents.addMagnet.useMutation({
    onSuccess: async () => {
      setMagnet("");
      await utils.torrents.list.invalidate();
    },
  });

  const setDownloadDirM = useSetDownloadDirM();

  const selectedTorrent =
    torrents.data?.find((torrent) => torrent.id === selectedTorrentId) ?? null;

  const uploadTorrentM = useUploadTorrentM();

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    await uploadTorrentM.mutateAsync({ file, activeDownloadDir });
    setUploading(false);
  };

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1440px] bg-slate-50 p-4 text-slate-800 sm:p-6">
      <header className="mb-5 grid items-start gap-6 lg:flex lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl leading-tight font-semibold text-slate-950">Seedbox</h1>
            <TransmissionStatus
              className="mt-1.5"
              isLoading={transmissionStatus.isLoading}
              running={transmissionStatus.data?.running}
              message={transmissionStatus.data?.message ?? transmissionStatus.error?.message}
            />
          </div>
          <p className="mt-1 text-slate-500">Локальное управление Transmission на Raspberry Pi</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
          <StorageSelector
            activeDownloadDir={activeDownloadDir}
            allowedDownloadDirs={storage.data?.allowedDownloadDirs ?? []}
            isLoading={storage.isLoading}
            isSaving={setDownloadDirM.isPending}
            onChange={(downloadDir) => setDownloadDirM.mutate({ downloadDir })}
          />
        </div>
      </header>

      <section className="mb-3 grid gap-3 lg:grid-cols-[1fr_auto]" aria-label="Добавление торрента">
        <form
          className="grid gap-2 sm:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (!magnet.trim()) return;

            addMagnetM.mutate({ magnet, downloadDir: activeDownloadDir || null });
          }}
        >
          <Input
            value={magnet}
            onChange={(event) => setMagnet(event.target.value)}
            placeholder="magnet:?xt=urn:btih:..."
            aria-label="Magnet-ссылка"
          />
          <Button variant="primary" type="submit" disabled={addMagnetM.isPending || !magnet.trim()}>
            {addMagnetM.isPending ? "Добавление" : "Добавить"}
          </Button>
        </form>
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-slate-800 transition hover:border-teal-700">
          <span>{uploading ? "Загрузка" : "Torrent-файл"}</span>
          <input
            className="hidden"
            type="file"
            accept=".torrent,application/x-bittorrent"
            disabled={uploading}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0] ?? null;
              void handleUpload(file);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </section>

      <StatusMessage
        error={
          storage.error?.message ??
          torrents.error?.message ??
          addMagnetM.error?.message ??
          uploadError ??
          setDownloadDirM.error?.message ??
          null
        }
      />

      <section
        key="torrents"
        className="grid items-start gap-4 xl:grid-cols-[minmax(420px,0.95fr)_minmax(480px,1.05fr)]"
      >
        <TorrentList
          torrents={torrents.data ?? []}
          isLoading={torrents.isLoading}
          selectedTorrentId={selectedTorrentId}
          onSelect={(id) => setSelectedTorrentId(id)}
        />
        <TorrentDetails torrent={selectedTorrent} />
      </section>
    </main>
  );
}

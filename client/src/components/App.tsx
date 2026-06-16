import { useState } from "react";
import { useSetDownloadDirM, useStorageSettings, useTorrents } from "../hooks/api";
import { primaryButtonClass } from "../styles";
import { trpc } from "../trpc";
import { StatusMessage } from "./StatusMessage";
import { StorageSelector } from "./StorageSelector";
import { TorrentDetails } from "./TorrentDetails";
import { TorrentList } from "./TorrentList";
import { Input } from "./ui/Input";

export default function App() {
  const utils = trpc.useUtils();
  const storage = useStorageSettings();
  const torrents = useTorrents();
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

  // const removeM = trpc.torrents.remove.useMutation({
  //   onSuccess: async () => {
  //     setSelectedTorrentId(null);
  //     await utils.torrents.list.invalidate();
  //   },
  // });

  const selectedTorrent =
    torrents.data?.find((torrent) => torrent.id === selectedTorrentId) ?? null;

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.set("file", file);
    if (activeDownloadDir) {
      formData.set("downloadDir", activeDownloadDir);
    }

    setUploading(true);
    setUploadError(null);
    try {
      const response = await fetch("/api/torrents/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to upload torrent");
      }
      await utils.torrents.list.invalidate();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1440px] bg-slate-50 p-4 text-slate-800 sm:p-6">
      <header className="mb-5 grid items-start gap-6 lg:flex lg:justify-between">
        <div>
          <h1 className="text-3xl leading-tight font-semibold text-slate-950">Seedbox</h1>
          <p className="mt-1 text-slate-500">Локальное управление Transmission на Raspberry Pi</p>
        </div>
        <StorageSelector
          activeDownloadDir={activeDownloadDir}
          allowedDownloadDirs={storage.data?.allowedDownloadDirs ?? []}
          isLoading={storage.isLoading}
          isSaving={setDownloadDirM.isPending}
          onChange={(downloadDir) => setDownloadDirM.mutate({ downloadDir })}
        />
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
          <button
            className={primaryButtonClass}
            type="submit"
            disabled={addMagnetM.isPending || !magnet.trim()}
          >
            {addMagnetM.isPending ? "Добавление" : "Добавить"}
          </button>
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

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(420px,0.95fr)_minmax(480px,1.05fr)]">
        <TorrentList
          torrents={torrents.data ?? []}
          isLoading={torrents.isLoading}
          selectedTorrentId={selectedTorrentId}
          onSelect={setSelectedTorrentId}
        />
        <TorrentDetails torrent={selectedTorrent} />
      </section>
    </main>
  );
}

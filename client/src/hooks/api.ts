import { useMutation } from "@tanstack/react-query";
import { trpc } from "../trpc";

export function useStorageSettings() {
  return trpc.settings.getStorage.useQuery();
}

export function useTorrents() {
  return trpc.torrents.list.useQuery(undefined, {
    refetchInterval: 2500,
  });
}

export function useTransmissionStatus() {
  return trpc.transmission.status.useQuery(undefined, {
    refetchInterval: 2500,
  });
}

export function useAddMagnetM() {
  const utils = trpc.useUtils();

  return trpc.torrents.addMagnet.useMutation({
    onSuccess: async () => {
      await utils.torrents.list.invalidate();
    },
  });
}

export function usePauseM() {
  const utils = trpc.useUtils();

  return trpc.torrents.pause.useMutation({
    onSuccess: () => utils.torrents.list.invalidate(),
  });
}

export function useResumeM() {
  const utils = trpc.useUtils();
  return trpc.torrents.resume.useMutation({
    onSuccess: () => utils.torrents.list.invalidate(),
  });
}

export function newFunctionName() {
  const utils = trpc.useUtils();
  return trpc.torrents.remove.useMutation({
    onSuccess: () => {
      utils.torrents.list.invalidate();
    },
  });
}

export function useSetDownloadDirM() {
  const utils = trpc.useUtils();

  return trpc.settings.setDownloadDir.useMutation({
    onSuccess: () => utils.settings.invalidate(),
  });
}

export function useRemoveM() {
  const utils = trpc.useUtils();

  return trpc.torrents.remove.useMutation({
    onSuccess: () => {
      utils.torrents.list.invalidate();
    },
  });
}

export function useUploadTorrentM() {
  const utils = trpc.useUtils();

  return useMutation({
    mutationKey: ["api", "torrents", "upload"],
    mutationFn: async (input: { file: File; activeDownloadDir: string | null }) => {
      const formData = new FormData();
      formData.set("file", input.file);
      if (input.activeDownloadDir) {
        formData.set("downloadDir", input.activeDownloadDir);
      }

      const response = await fetch("/api/torrents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to upload torrent");
      }
    },
    async onSuccess() {
      await utils.torrents.list.invalidate();
    },
  });
}

import { trpc } from "../trpc";

export function useStorageSettings() {
  return trpc.settings.getStorage.useQuery();
}

export function useTorrents() {
  return trpc.torrents.list.useQuery(undefined, {
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

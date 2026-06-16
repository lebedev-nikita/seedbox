import z from "zod";
import { env } from "../env";
import {
  assertAllowedDownloadDir,
  getActiveDownloadDir,
  setActiveDownloadDir,
} from "../sensors/storage";
import {
  addMagnet,
  getTransmissionStatus,
  getTorrentFiles,
  listTorrents,
  removeTorrent,
  startTorrent,
  stopTorrent,
} from "../sensors/transmission";
import { procedure, router } from "./_trpc";

export const appRouter = router({
  settings: router({
    getStorage: procedure.query(async () => ({
      allowedDownloadDirs: env.SEEDBOX_ALLOWED_DOWNLOAD_DIRS,
      activeDownloadDir: await getActiveDownloadDir(),
    })),

    setDownloadDir: procedure
      .input(
        z.object({
          downloadDir: z.string().min(1),
        }),
      )
      .mutation(async ({ input }) => {
        return {
          activeDownloadDir: await setActiveDownloadDir(input.downloadDir),
          allowedDownloadDirs: env.SEEDBOX_ALLOWED_DOWNLOAD_DIRS,
        };
      }),
  }),

  transmission: router({
    status: procedure.query(async () => {
      return await getTransmissionStatus();
    }),
  }),

  torrents: router({
    list: procedure.query(async () => {
      return await listTorrents();
    }),
    files: procedure
      .input(
        z.object({
          id: z.number().int().positive(),
        }),
      )
      .query(async ({ input }) => {
        return await getTorrentFiles(input.id);
      }),
    addMagnet: procedure
      .input(
        z.object({
          magnet: z.string().trim().min(1),
          downloadDir: z.enum(env.SEEDBOX_ALLOWED_DOWNLOAD_DIRS).nullable().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        if (input.downloadDir) {
          assertAllowedDownloadDir(input.downloadDir);
        }
        await addMagnet(input.magnet, input.downloadDir);
      }),
    pause: procedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await stopTorrent(input.id);
      }),
    resume: procedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await startTorrent(input.id);
      }),
    remove: procedure
      .input(
        z.object({
          id: z.number().int().positive(),
          deleteLocalData: z.boolean(),
        }),
      )
      .mutation(async ({ input }) => {
        await removeTorrent(input.id, input.deleteLocalData);
      }),
  }),
});

export type AppRouter = typeof appRouter;

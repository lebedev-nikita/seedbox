import type { AppRouter } from "@server/src/api/trpc";
import type { inferRouterOutputs } from "@trpc/server";

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type Torrent = RouterOutput["torrents"]["list"][number];
export type TorrentFile = RouterOutput["torrents"]["files"]["files"][number];

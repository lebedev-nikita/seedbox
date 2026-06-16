import { getActiveDownloadDir } from "./storage";

type RpcResponse<T> = {
  result: string;
  arguments?: T;
};

type TorrentFile = {
  name: string;
  length: number;
  bytesCompleted: number;
};

type TransmissionTorrent = {
  id: number;
  name: string;
  status: number;
  totalSize: number;
  percentDone: number;
  rateDownload: number;
  rateUpload: number;
  uploadRatio: number;
  eta: number;
  downloadDir: string;
  isFinished: boolean;
  leftUntilDone: number;
  files?: TorrentFile[];
};

export type TorrentSummary = {
  id: number;
  name: string;
  status: TorrentStatus;
  statusCode: number;
  totalSize: number;
  percentDone: number;
  rateDownload: number;
  rateUpload: number;
  uploadRatio: number;
  eta: number | null;
  downloadDir: string;
  isFinished: boolean;
  leftUntilDone: number;
};

export type TorrentFileInfo = TorrentFile & {
  index: number;
  percentDone: number;
};

export type TransmissionStatus = {
  running: boolean;
  message?: string;
};

const torrentFields = [
  "id",
  "name",
  "status",
  "totalSize",
  "percentDone",
  "rateDownload",
  "rateUpload",
  "uploadRatio",
  "eta",
  "downloadDir",
  "isFinished",
  "leftUntilDone",
] satisfies Array<keyof TransmissionTorrent>;

const torrentFileFields = [...torrentFields, "files"] satisfies Array<keyof TransmissionTorrent>;

let sessionId: string | null = null;

function getRpcUrl() {
  return process.env.TRANS_RPC_URL ?? "http://127.0.0.1:9091/transmission/rpc";
}

function getDisplayRpcUrl() {
  const rpcUrl = getRpcUrl();

  try {
    const url = new URL(rpcUrl);
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return rpcUrl;
  }
}

function getAuthorizationHeader() {
  const username = process.env.TRANS_RPC_USERNAME;
  const password = process.env.TRANS_RPC_PASSWORD;

  if (!username && !password) {
    return null;
  }

  return `Basic ${btoa(`${username ?? ""}:${password ?? ""}`)}`;
}

async function callTransmission<T>(method: string, args: Record<string, unknown> = {}) {
  const headers = new Headers({
    "content-type": "application/json",
  });
  const authorization = getAuthorizationHeader();

  if (authorization) {
    headers.set("authorization", authorization);
  }
  if (sessionId) {
    headers.set("x-transmission-session-id", sessionId);
  }

  const body = JSON.stringify({ method, arguments: args });
  let response: Response;

  try {
    response = await fetch(getRpcUrl(), { method: "POST", headers, body });
  } catch (error) {
    throw new Error(
      `Transmission RPC is unreachable at ${getDisplayRpcUrl()}. Check that transmission-daemon is running, RPC is enabled, and TRANS_RPC_URL points to an address reachable from this server process.`,
      { cause: error },
    );
  }

  if (response.status === 409) {
    sessionId = response.headers.get("x-transmission-session-id");
    if (!sessionId) {
      throw new Error("Transmission did not return a session id");
    }
    headers.set("x-transmission-session-id", sessionId);
    try {
      response = await fetch(getRpcUrl(), { method: "POST", headers, body });
    } catch (error) {
      throw new Error(
        `Transmission RPC is unreachable at ${getDisplayRpcUrl()} after session negotiation. Check that transmission-daemon is running and reachable from this server process.`,
        { cause: error },
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      `Transmission RPC at ${getDisplayRpcUrl()} failed with HTTP ${response.status}. Check RPC credentials, rpc-whitelist, and transmission-daemon settings.`,
    );
  }

  const payload = (await response.json()) as RpcResponse<T>;
  if (payload.result !== "success") {
    throw new Error(`Transmission RPC failed: ${payload.result}`);
  }

  return payload.arguments as T;
}

type TorrentStatus =
  | "stopped"
  | "check-wait"
  | "checking"
  | "download-wait"
  | "downloading"
  | "seed-wait"
  | "seeding"
  | "unknown";

function mapStatus(status: number): TorrentStatus {
  switch (status) {
    case 0:
      return "stopped";
    case 1:
      return "check-wait";
    case 2:
      return "checking";
    case 3:
      return "download-wait";
    case 4:
      return "downloading";
    case 5:
      return "seed-wait";
    case 6:
      return "seeding";
    default:
      return "unknown";
  }
}

function summarizeTorrent(torrent: TransmissionTorrent): TorrentSummary {
  return {
    id: torrent.id,
    name: torrent.name,
    status: mapStatus(torrent.status),
    statusCode: torrent.status,
    totalSize: torrent.totalSize,
    percentDone: torrent.percentDone,
    rateDownload: torrent.rateDownload,
    rateUpload: torrent.rateUpload,
    uploadRatio: torrent.uploadRatio,
    eta: torrent.eta >= 0 ? torrent.eta : null,
    downloadDir: torrent.downloadDir,
    isFinished: torrent.isFinished,
    leftUntilDone: torrent.leftUntilDone,
  };
}

export async function listTorrents() {
  const result = await callTransmission<{ torrents: TransmissionTorrent[] }>("torrent-get", {
    fields: torrentFields,
  });

  return result.torrents.map(summarizeTorrent);
}

export async function getTransmissionStatus(): Promise<TransmissionStatus> {
  try {
    await callTransmission("session-get");
    return { running: true };
  } catch (error) {
    return {
      running: false,
      message: error instanceof Error ? error.message : "Transmission RPC is unavailable",
    };
  }
}

export async function getTorrentFiles(id: number) {
  const torrent = await getTorrentWithFiles(id);

  return {
    torrent: summarizeTorrent(torrent),
    files: (torrent.files ?? []).map<TorrentFileInfo>((file, index) => ({
      ...file,
      index,
      percentDone: file.length > 0 ? file.bytesCompleted / file.length : 1,
    })),
  };
}

export async function getTorrentWithFiles(id: number) {
  const result = await callTransmission<{ torrents: TransmissionTorrent[] }>("torrent-get", {
    ids: [id],
    fields: torrentFileFields,
  });
  const torrent = result.torrents[0];

  if (!torrent) {
    throw new Error("Torrent not found");
  }

  return torrent;
}

export async function addMagnet(filename: string, downloadDir?: string | null) {
  const targetDir = downloadDir ?? (await getActiveDownloadDir());

  if (!targetDir) {
    throw new Error("No download directory configured");
  }

  await callTransmission("torrent-add", {
    filename,
    "download-dir": targetDir,
  });
}

export async function addTorrentMetainfo(metainfo: string, downloadDir?: string | null) {
  const targetDir = downloadDir ?? (await getActiveDownloadDir());

  if (!targetDir) {
    throw new Error("No download directory configured");
  }

  await callTransmission("torrent-add", {
    metainfo,
    "download-dir": targetDir,
  });
}

export async function startTorrent(id: number) {
  await callTransmission("torrent-start", { ids: [id] });
}

export async function stopTorrent(id: number) {
  await callTransmission("torrent-stop", { ids: [id] });
}

export async function removeTorrent(id: number, deleteLocalData: boolean) {
  await callTransmission("torrent-remove", {
    ids: [id],
    "delete-local-data": deleteLocalData,
  });
}

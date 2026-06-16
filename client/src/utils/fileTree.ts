import type { TorrentFile } from "../types";

export type FileTreeNode = {
  name: string;
  path: string;
  children: FileTreeNode[];
  file?: TorrentFile;
};

export function buildFileTree(files: TorrentFile[]) {
  const roots: FileTreeNode[] = [];

  for (const file of files) {
    const parts = file.name.split("/").filter(Boolean);
    let level = roots;
    let currentPath = "";

    parts.forEach((part, partIndex) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let node = level.find((child) => child.name === part);
      if (!node) {
        node = { name: part, path: currentPath, children: [] };
        level.push(node);
      }
      if (partIndex === parts.length - 1) {
        node.file = file;
      }
      level = node.children;
    });
  }

  return roots;
}

import { Select } from "./ui/Input";

export function StorageSelector({
  activeDownloadDir,
  allowedDownloadDirs,
  isLoading,
  isSaving,
  onChange,
}: {
  activeDownloadDir: string;
  allowedDownloadDirs: string[];
  isLoading: boolean;
  isSaving: boolean;
  onChange: (downloadDir: string) => void;
}) {
  return (
    <label className="grid w-full gap-1.5 text-sm text-slate-500 lg:w-[460px]">
      <span>Папка загрузок</span>
      <Select
        value={activeDownloadDir}
        disabled={isLoading || isSaving || allowedDownloadDirs.length === 0}
        onChange={(event) => onChange(event.target.value)}
      >
        {allowedDownloadDirs.length === 0 && (
          <option value="">SEEDBOX_ALLOWED_DOWNLOAD_DIRS не задан</option>
        )}
        {allowedDownloadDirs.map((dir) => (
          <option key={dir} value={dir} children={dir} />
        ))}
      </Select>
    </label>
  );
}

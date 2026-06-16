export function StatusMessage({ error }: { error: string | null }) {
  if (!error) return null;

  return (
    <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
      {error}
    </div>
  );
}

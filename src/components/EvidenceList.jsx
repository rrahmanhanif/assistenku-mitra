import { StatusChip } from "./StatusChip";

export function EvidenceList({ evidences }) {
  if (!evidences || evidences.length === 0) {
    return <div className="text-sm text-gray-600">Belum ada evidence.</div>;
  }
  return (
    <ul className="space-y-2">
      {evidences.map((ev) => (
        <li key={ev.id || ev.pointer} className="border p-3 rounded-lg bg-white">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">{ev.type || ev.mime}</div>
            <StatusChip status={ev.locked ? "LOCKED" : "PENDING"} />
          </div>
          <div className="text-xs text-gray-500">{ev.pointer || ev.file_url}</div>
          {ev.metadata && (
            <pre className="text-xs bg-gray-50 rounded p-2 mt-1 whitespace-pre-wrap">
              {JSON.stringify(ev.metadata, null, 2)}
            </pre>
          )}
        </li>
      ))}
    </ul>
  );
}

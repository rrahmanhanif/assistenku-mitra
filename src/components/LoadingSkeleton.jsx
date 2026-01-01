export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="bg-gray-200 animate-pulse h-4 rounded" />
      ))}
    </div>
  );
}

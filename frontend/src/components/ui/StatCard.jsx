import { memo } from "react";

function StatCard({ value, label }) {
  return (
    <div className="card-surface px-5 py-4">
      <p className="text-2xl font-display font-semibold text-blue-400">{value}</p>
      <p className="text-xs text-cloud-500 mt-1">{label}</p>
    </div>
  );
}

export default memo(StatCard);

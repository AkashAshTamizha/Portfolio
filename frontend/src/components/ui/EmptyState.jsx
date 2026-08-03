import { FiInbox } from "react-icons/fi";

export default function EmptyState({ message = "No data available.", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-ink-700 [html.light_&]:border-paper-300 ${className}`}
    >
      <FiInbox className="h-8 w-8 text-cloud-600 mb-3" />
      <p className="text-sm text-cloud-500">{message}</p>
    </div>
  );
}

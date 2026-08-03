import { LuX } from "react-icons/lu";

export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-ink-900 border border-ink-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold font-display text-cloud-100">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-cloud-400 hover:bg-ink-700" aria-label="Close">
            <LuX className="h-4.5 w-4.5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

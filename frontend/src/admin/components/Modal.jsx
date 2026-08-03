import { useEffect } from "react";
import { LuX } from "react-icons/lu";

export default function Modal({ open, title, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${wide ? "max-w-2xl" : "max-w-lg"} sm:rounded-2xl bg-ink-800 border border-ink-700 shadow-glass max-h-screen sm:max-h-[90vh] overflow-y-auto`}
      >
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-ink-700 bg-ink-800/95 backdrop-blur">
          <h2 className="font-display text-lg font-semibold text-cloud-100">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-cloud-400 hover:bg-ink-700" aria-label="Close">
            <LuX className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

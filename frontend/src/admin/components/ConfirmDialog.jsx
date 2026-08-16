import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  onConfirm,
  onCancel,
  loading,
  confirmLabel = "Delete",
  confirmLoadingLabel = "Deleting…",
  confirmClassName = "bg-coral-500 hover:bg-coral-600",
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-cloud-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-cloud-300 hover:bg-ink-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60 ${confirmClassName}`}
        >
          {loading ? confirmLoadingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

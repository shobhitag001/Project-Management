import { Button } from "./ui";

export function ConfirmDialog({
  open,
  title,
  message,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  busy?: boolean;
  onCancel(): void;
  onConfirm(): void;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <div
        className="modal compact"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <Button variant="secondary" disabled={busy} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" disabled={busy} onClick={onConfirm}>
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

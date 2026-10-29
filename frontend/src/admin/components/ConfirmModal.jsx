import { Modal } from '@mantine/core';
import { Button } from '@/components/ui';

/** Confirmation for destructive actions. Focus is trapped and returned by Mantine's Modal. */
export function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  tone = 'danger',
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="md" closeOnClickOutside={!loading} closeOnEscape={!loading}>
      <div className="admin-confirm">
        {message && <p className="admin-confirm__message">{message}</p>}
        <div className="admin-confirm__actions">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant={tone} size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

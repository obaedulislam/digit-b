import { ConfirmModal } from './ConfirmModal';

export function UnsavedChangesModal({ guard }) {
  const { blocker } = guard;
  return (
    <ConfirmModal
      opened={blocker.state === 'blocked'}
      onClose={() => blocker.reset?.()}
      onConfirm={() => blocker.proceed?.()}
      title="Leave without saving?"
      message="You have unsaved changes. If you leave this page they will be lost."
      confirmLabel="Leave page"
      cancelLabel="Keep editing"
    />
  );
}

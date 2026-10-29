import { useState } from 'react';
import { IconDownload } from '@tabler/icons-react';
import { Button } from '@/components/ui';
import { downloadFile } from '../lib/download';
import { mapFormError } from '../lib/formErrors';
import { notifyError, notifySuccess } from '../lib/notify';

/** Authenticated CSV export: fetched as a blob with the session cookie, saved with the server's file name. */
export function ExportButton({ path, params, fallbackName = 'export.csv', label = 'Export CSV' }) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const name = await downloadFile(path, { params, fallbackName });
      notifySuccess(`${name} downloaded`, 'Export ready');
    } catch (error) {
      notifyError(mapFormError(error).message, 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={run} loading={busy} leftIcon={<IconDownload size={16} stroke={1.75} />}>
      {label}
    </Button>
  );
}

import { useId, useRef, useState } from 'react';
import { TextInput } from '@mantine/core';
import { IconPhotoPlus, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui';
import { mediaApi } from '../../api/resources';
import { mapFormError } from '../../lib/formErrors';
import { notifyError } from '../../lib/notify';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Image picker that uploads to `POST /admin/media` and stores the returned
 * relative URL. Optionally edits the alt text next to the preview.
 */
export function ImageUploadField({ label, value, onChange, error, alt, onAltChange, altError, altLabel = 'Image description (alt text)', hint }) {
  const id = useId();
  const input = useRef(null);
  const [progress, setProgress] = useState(null);
  const [localError, setLocalError] = useState('');
  const uploading = progress !== null;

  const pick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setLocalError('');
    if (!ACCEPT.split(',').includes(file.type)) {
      setLocalError('Choose a JPG, PNG, WebP or AVIF image.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError('The image must be 4 MB or smaller.');
      return;
    }
    setProgress(0);
    try {
      const uploaded = await mediaApi.upload(file, setProgress);
      onChange(uploaded.url);
    } catch (uploadError) {
      const mapped = mapFormError(uploadError);
      const message = mapped.fieldErrors.file || mapped.message;
      setLocalError(message);
      notifyError(message, 'Upload failed');
    } finally {
      setProgress(null);
    }
  };

  const shownError = error || localError;

  return (
    <div className="admin-upload field">
      <span className="field__label" id={`${id}-label`}>
        {label}
      </span>
      {hint && <p className="field__hint">{hint}</p>}

      <div className="admin-upload__body">
        <div className="admin-upload__preview" aria-live="polite">
          {value ? <img src={value} alt={alt || ''} className="admin-upload__img" /> : <IconPhotoPlus size={28} stroke={1.25} aria-hidden="true" />}
          {!value && <span className="admin-upload__placeholder">No image</span>}
        </div>
        <div className="admin-upload__controls">
          <input id={id} ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={pick} aria-labelledby={`${id}-label`} />
          <div className="admin-upload__buttons">
            <Button variant="secondary" size="sm" onClick={() => input.current?.click()} loading={uploading} leftIcon={<IconPhotoPlus size={16} stroke={1.75} />}>
              {value ? 'Replace image' : 'Upload image'}
            </Button>
            {value && (
              <Button variant="ghost" size="sm" onClick={() => onChange('')} disabled={uploading} leftIcon={<IconTrash size={16} stroke={1.75} />}>
                Remove
              </Button>
            )}
          </div>
          {uploading && (
            <p className="field__hint" role="status">
              Uploading… {progress}%
            </p>
          )}
          <p className="field__hint">JPG, PNG, WebP or AVIF, up to 4 MB.</p>
          {onAltChange && (
            <TextInput label={altLabel} value={alt ?? ''} onChange={(event) => onAltChange(event.currentTarget.value)} error={altError} maxLength={255} />
          )}
        </div>
      </div>
      {shownError && (
        <p className="field__error" role="alert">
          {shownError}
        </p>
      )}
    </div>
  );
}

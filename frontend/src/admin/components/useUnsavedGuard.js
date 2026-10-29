import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Warns before losing unsaved edits: in-app navigation (router blocker) and
 * tab close / reload (beforeunload).
 *
 *   const guard = useUnsavedGuard(isDirty);
 *   guard.allowNext();           // call right before navigating away after a successful save
 *   <UnsavedChangesModal guard={guard} />
 */
export function useUnsavedGuard(dirty) {
  const allow = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !allow.current && currentLocation.pathname + currentLocation.search !== nextLocation.pathname + nextLocation.search,
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return {
    blocker,
    dirty,
    allowNext: () => {
      allow.current = true;
    },
  };
}

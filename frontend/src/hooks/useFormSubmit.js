import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { parseApiError } from '@/api/client';

/**
 * Wires a Mantine form to an API mutation:
 *  - maps Laravel 422 field errors onto the form
 *  - exposes a form-level `error` message (network / 429 / 5xx)
 *  - fires a success notification and an optional callback
 *
 *   const { submit, isPending, error, isSuccess, reset } = useFormSubmit(form, {
 *     mutationFn: publicApi.submitContact,
 *     successMessage: 'Thanks — we will reply within one business day.',
 *     onSuccess: () => form.reset(),
 *   });
 *   <form onSubmit={form.onSubmit(submit)}>
 */
export function useFormSubmit(form, { mutationFn, successTitle = 'Sent', successMessage, onSuccess, transform }) {
  const mutation = useMutation({
    mutationFn: (values) => mutationFn(transform ? transform(values) : values),
    onSuccess: (data, values) => {
      if (successMessage) {
        notifications.show({ title: successTitle, message: successMessage, color: 'lime', autoClose: 6000 });
      }
      onSuccess?.(data, values);
    },
    onError: (error) => {
      const { fieldErrors } = parseApiError(error);
      if (Object.keys(fieldErrors).length) form.setErrors(fieldErrors);
    },
  });

  const apiError = mutation.error ? parseApiError(mutation.error) : null;
  // A 422 is shown inline per field; anything else is a form-level message.
  const error = apiError && apiError.status !== 422 ? apiError.message : null;

  return {
    submit: (values) => mutation.mutate(values),
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    error,
    reset: mutation.reset,
  };
}

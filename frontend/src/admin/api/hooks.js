import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from './keys';
import { mapFormError, focusFirstInvalid } from '../lib/formErrors';
import { notifyError, notifySuccess } from '../lib/notify';

/** Paginated list; keeps the previous page on screen while the next one loads. */
export function useResourceList(resource, params, options = {}) {
  return useQuery({
    queryKey: adminKeys.list(resource.name, params),
    queryFn: () => resource.list(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useResourceDetail(resource, id, options = {}) {
  return useQuery({
    queryKey: adminKeys.detail(resource.name, id),
    queryFn: () => resource.get(id),
    enabled: id !== undefined && id !== null && id !== '',
    ...options,
  });
}

/** Small lookup lists for selects (jobs, categories, roles…). */
export function useOptionsList(resource, params = { per_page: 50 }, options = {}) {
  return useQuery({
    queryKey: adminKeys.options(resource.name, params),
    queryFn: () => resource.list(params),
    staleTime: 60_000,
    select: (response) => response.data,
    ...options,
  });
}

/**
 * Mutation with the admin conventions baked in:
 *  - invalidates the given query keys after success
 *  - success toast (string or fn)
 *  - 422 -> field errors on `form`; anything else -> error toast
 */
export function useAdminMutation({ mutationFn, invalidate = [], successMessage, form, onSuccess, onError }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (data, variables) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      const message = typeof successMessage === 'function' ? successMessage(data, variables) : successMessage;
      if (message) notifySuccess(message);
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      const mapped = mapFormError(error);
      if (form && mapped.isValidation) {
        form.setErrors(mapped.fieldErrors);
        focusFirstInvalid();
      }
      notifyError(mapped.message);
      onError?.(mapped, variables);
    },
  });
}

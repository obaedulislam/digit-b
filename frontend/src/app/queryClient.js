import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Never retry client errors (404/422/401…); retry transient failures once.
      retry: (failureCount, error) => {
        const status = error?.response?.status ?? 0;
        return status === 0 || status >= 500 ? failureCount < 1 : false;
      },
    },
  },
});

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { mantineTheme } from '@/theme/mantine';
import { queryClient } from './queryClient';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={mantineTheme} forceColorScheme="light" withGlobalClasses={false}>
        <Notifications position="top-right" limit={3} zIndex={300} />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}

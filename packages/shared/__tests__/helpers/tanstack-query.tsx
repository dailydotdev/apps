import { QueryClientConfig } from '@tanstack/react-query';

export const defaultQueryClientTestingConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
};

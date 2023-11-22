import { useMemo } from 'react';
import request from 'graphql-request';
import { useQueryClient } from '@tanstack/react-query';
import { RequestProtocol, REQUEST_PROTOCOL_KEY } from '../graphql/common';
import { commonRequestHeaders } from '../lib/headers';

export const useRequestProtocol = (): RequestProtocol => {
  const client = useQueryClient();
  const { requestMethod, fetchMethod, isCompanion } =
    client.getQueryData<RequestProtocol>(REQUEST_PROTOCOL_KEY) || {};

  return useMemo(() => {
    const requester = requestMethod || request;
    const fetcher = fetchMethod || fetch;

    return {
      requestMethod: (url, document, variables, requestHeaders) =>
        requester(url, document, variables, {
          ...requestHeaders,
          ...commonRequestHeaders,
        }),

      fetchMethod: (input, init) =>
        fetcher(input, {
          ...init,
          headers: { ...init?.headers, ...commonRequestHeaders },
        }),

      isCompanion,
    };
  }, [requestMethod, fetchMethod, isCompanion]);
};

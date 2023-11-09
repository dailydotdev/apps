import { useMemo } from 'react';
import request from 'graphql-request';
import { useQueryClient } from '@tanstack/react-query';
import { RequestProtocol, REQUEST_PROTOCOL_KEY } from '../graphql/common';

export const useRequestProtocol = (): RequestProtocol => {
  const client = useQueryClient();
  const { requestMethod, fetchMethod, isCompanion } =
    client.getQueryData<RequestProtocol>(REQUEST_PROTOCOL_KEY) || {};

  return useMemo(
    () => ({
      requestMethod: requestMethod || request,
      fetchMethod: fetchMethod || fetch,
      isCompanion,
    }),
    [requestMethod, fetchMethod, isCompanion],
  );
};

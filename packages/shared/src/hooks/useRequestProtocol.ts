import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { RequestProtocol } from '../graphql/common';
import { REQUEST_PROTOCOL_KEY, gqlRequest } from '../graphql/common';

type ResolvedRequestProtocol = {
  requestMethod: NonNullable<RequestProtocol['requestMethod']>;
  fetchMethod: NonNullable<RequestProtocol['fetchMethod']>;
  isCompanion?: boolean;
};

export const useRequestProtocol = (): ResolvedRequestProtocol => {
  const client = useQueryClient();
  const { requestMethod, fetchMethod, isCompanion } =
    client.getQueryData<RequestProtocol>(REQUEST_PROTOCOL_KEY) || {};

  return useMemo(
    () => ({
      requestMethod: requestMethod || gqlRequest,
      fetchMethod: fetchMethod || fetch,
      isCompanion,
    }),
    [requestMethod, fetchMethod, isCompanion],
  );
};

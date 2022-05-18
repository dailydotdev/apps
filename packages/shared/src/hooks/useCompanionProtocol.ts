import request from 'graphql-request';
import { useQueryClient } from 'react-query';
import { CompanionProtocol, COMPANION_PROTOCOL_KEY } from '../graphql/common';

export const useCompanionProtocol = (): {
  requestMethod?: typeof request;
  fetchMethod?: typeof fetch;
} => {
  const client = useQueryClient();
  const { companionRequest, companionFetch } =
    client.getQueryData<CompanionProtocol>(COMPANION_PROTOCOL_KEY) || {};

  const requestMethod = companionRequest || request;
  const fetchMethod = companionFetch || fetch;

  return { requestMethod, fetchMethod };
};

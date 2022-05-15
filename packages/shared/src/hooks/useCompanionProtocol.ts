import { useQueryClient } from 'react-query';
import { CompanionProtocol, COMPANION_PROTOCOL_KEY } from '../graphql/common';

export const useCompanionProtocol = (): CompanionProtocol => {
  const client = useQueryClient();
  const protocol = client.getQueryData<CompanionProtocol>(
    COMPANION_PROTOCOL_KEY,
  );

  return protocol || {};
};

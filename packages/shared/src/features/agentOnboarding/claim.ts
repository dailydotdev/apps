import { apiUrl } from '../../lib/config';
import { generateQueryKey, RequestKey } from '../../lib/query';

export enum AgentClaimStatus {
  Pending = 'pending',
  Claimed = 'claimed',
  Expired = 'expired',
}

export enum AgentClaimErrorCode {
  Expired = 'expired',
  ClaimedByOther = 'claimed_by_other',
  ProfileIncomplete = 'profile_incomplete',
  ApiAccessDisabled = 'api_access_disabled',
  TokenLimit = 'token_limit',
}

export type AgentClaimInfo = {
  status: AgentClaimStatus;
  userCode?: string;
  client?: string;
  expiresAt?: string;
};

export class AgentClaimError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

const CLAIM_URL = `${apiUrl}/agents/v1/claim`;
const GENERIC_ERROR = 'Something went wrong. Please try again.';

const getAgentClaimInfo = async (code: string): Promise<AgentClaimInfo> => {
  const res = await fetch(`${CLAIM_URL}?code=${encodeURIComponent(code)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new AgentClaimError(GENERIC_ERROR);
  }

  return res.json();
};

export const agentClaimQueryOptions = (code: string) => ({
  queryKey: generateQueryKey(RequestKey.AgentClaim, undefined, code),
  queryFn: () => getAgentClaimInfo(code),
});

export const claimAgent = async (code: string): Promise<AgentClaimInfo> => {
  const res = await fetch(CLAIM_URL, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ code }),
  });
  const data: AgentClaimInfo & { error?: string; message?: string } = await res
    .json()
    .catch(() => ({}));
  if (!res.ok) {
    throw new AgentClaimError(data.message || GENERIC_ERROR, data.error);
  }

  return data;
};

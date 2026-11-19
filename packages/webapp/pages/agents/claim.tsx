import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { AgentClaim } from '@dailydotdev/shared/src/features/agentOnboarding/components/AgentClaim';
import { getFirstQueryParam } from '@dailydotdev/shared/src/lib/func';
import { noindexSeoProps } from '../../next-seo';

const AgentClaimPage = (): ReactElement | null => {
  const { query, isReady } = useRouter();

  if (!isReady) {
    return null;
  }

  return <AgentClaim code={getFirstQueryParam(query.code)} />;
};

AgentClaimPage.layoutProps = { seo: { ...noindexSeoProps } };

export default AgentClaimPage;

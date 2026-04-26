import type { GetServerSidePropsResult } from 'next';
import type { ReactElement } from 'react';
import { agentsHighlightsPath } from '@dailydotdev/shared/src/lib/links';

const AgentEntityRedirect = (): ReactElement | null => null;

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<Record<string, never>>
> {
  return {
    redirect: {
      destination: agentsHighlightsPath,
      permanent: false,
    },
  };
}

export default AgentEntityRedirect;

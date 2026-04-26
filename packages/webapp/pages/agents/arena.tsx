import type { GetStaticPropsResult } from 'next';
import type { ReactElement } from 'react';
import { agentsHighlightsPath } from '@dailydotdev/shared/src/lib/links';

const ArenaPageRedirect = (): ReactElement | null => null;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<Record<string, never>>
> {
  return {
    redirect: {
      destination: agentsHighlightsPath,
      permanent: false,
    },
  };
}

export default ArenaPageRedirect;

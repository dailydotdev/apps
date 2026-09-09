import type { GetServerSideProps } from 'next';
import type { ReactElement } from 'react';
import { agentsHighlightsPath } from '@dailydotdev/shared/src/lib/links';

const AgentsPageRedirect = (): ReactElement | null => null;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: agentsHighlightsPath,
      permanent: false,
    },
  };
};

export default AgentsPageRedirect;

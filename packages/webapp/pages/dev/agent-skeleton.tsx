import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { AgentDemoProviders } from '@dailydotdev/shared/src/features/interests/components/AgentDemoProviders';
import { AgentWorkspaceSkeleton } from '@dailydotdev/shared/src/features/interests/components/AgentWorkspaceSkeleton';

// The real skeleton is only up while a fetch is in flight, too short to review.
const Page = (): ReactElement => (
  <AgentDemoProviders>
    <NextSeo title="Agent skeleton" noindex nofollow />
    <AgentWorkspaceSkeleton isStandalone />
  </AgentDemoProviders>
);

export { devPageServerSideProps as getServerSideProps } from '../../lib/devPage';

export default Page;

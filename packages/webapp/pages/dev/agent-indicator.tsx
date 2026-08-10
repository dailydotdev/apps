import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { AgentThinkingOrbLab } from '@dailydotdev/shared/src/features/interests/components/AgentThinkingOrbLab';

// The same gallery as the Storybook story, on a real route: Storybook is not
// deployed, so picking a state off a Vercel preview needs one.
const Page = (): ReactElement => (
  <>
    <NextSeo title="Agent thinking indicator" noindex nofollow />
    <AgentThinkingOrbLab />
  </>
);

export { devPageServerSideProps as getServerSideProps } from '../../lib/devPage';

export default Page;

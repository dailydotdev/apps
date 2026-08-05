import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';
import { AgentThinkingOrbLab } from '@dailydotdev/shared/src/features/interests/components/AgentThinkingOrbLab';

/**
 * /dev/agent-indicator — the five thinking-indicator states, side by side.
 *
 * The same gallery is a Storybook story, but Storybook is not deployed
 * anywhere, so picking a state off a Vercel preview needs a real route. `_app`
 * short-circuits `/dev/*` past the whole app shell, so this renders without
 * boot and works on any deployment. Carries `noindex`/`nofollow`.
 */
const Page = (): ReactElement => (
  <>
    <NextSeo title="Agent thinking indicator" noindex nofollow />
    <AgentThinkingOrbLab />
  </>
);

export default Page;

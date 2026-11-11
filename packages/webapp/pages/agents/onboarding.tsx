import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { AgentOnboardingLanding } from '@dailydotdev/shared/src/features/agentOnboarding/components/AgentOnboardingLanding';
import { aiAgentsOpenGraph, noindexSeoProps } from '../../next-seo';

// A focused page: no sidebar or header.
const AgentOnboardingPage = (): ReactElement => <AgentOnboardingLanding />;

// Not indexed until the flow is linked from the apps.
const seo: NextSeoProps = {
  title: 'Set up daily.dev with your agent',
  description:
    'Copy one prompt into your coding agent. It creates your daily.dev account with you and builds a feed around what you work on.',
  openGraph: aiAgentsOpenGraph,
  ...noindexSeoProps,
};

AgentOnboardingPage.layoutProps = { seo };

export default AgentOnboardingPage;

import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { FunnelPersonaQuiz } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPersonaQuiz';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepBackground';
import type { FunnelStepPersonaQuiz } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelBackgroundVariant,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

const seoTitles = getPageSeoTitles('Persona quiz demo');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  nofollow: true,
  noindex: true,
  ...defaultSeo,
};

function PersonaQuizDemo(): ReactElement {
  const step = {
    id: 'persona-quiz-demo',
    type: FunnelStepType.PersonaQuiz,
    isActive: true,
    parameters: {
      backgroundType: FunnelBackgroundVariant.Blank,
      mascotVideoBaseUrl: '/onboarding/patchy',
    },
    transitions: [],
    onTransition: () => undefined,
  } as unknown as FunnelStepPersonaQuiz;

  return (
    <div className="flex min-h-dvh flex-col">
      <FunnelStepBackground step={step}>
        <div className="mx-auto flex w-full max-w-screen-laptop flex-1 flex-col">
          <FunnelPersonaQuiz {...step} />
        </div>
      </FunnelStepBackground>
    </div>
  );
}

PersonaQuizDemo.layoutProps = { seo };

export default PersonaQuizDemo;

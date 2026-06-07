import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import { FunnelPersonaQuiz } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPersonaQuiz';
import { FunnelStepBackground } from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepBackground';
import type {
  FunnelStepPersonaQuiz,
  FunnelStepTransitionCallback,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import {
  FunnelBackgroundVariant,
  FunnelStepType,
} from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
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

type CompletionDetails = {
  persona?: string;
  modifiers?: string[];
  confidence?: number;
  questions: number;
};

function PersonaQuizDemo(): ReactElement {
  const [completion, setCompletion] = useState<CompletionDetails | null>(null);
  const [runKey, setRunKey] = useState(0);

  const onTransition: FunnelStepTransitionCallback<CompletionDetails> = ({
    details,
  }) => {
    setCompletion(details ?? null);
  };

  const step = {
    id: 'persona-quiz-demo',
    type: FunnelStepType.PersonaQuiz,
    isActive: true,
    parameters: {
      backgroundType: FunnelBackgroundVariant.Default,
      mascotVideoUrl: '/onboarding/patchy.webm',
    },
    transitions: [],
    onTransition,
  } as unknown as FunnelStepPersonaQuiz;

  return (
    <div className="flex min-h-dvh flex-col">
      <FunnelStepBackground step={step}>
        <div className="mx-auto flex w-full max-w-screen-laptop flex-1 flex-col">
          <FunnelPersonaQuiz key={runKey} {...step} />
        </div>
      </FunnelStepBackground>

      {completion && (
        <div className="fixed bottom-4 right-4 z-modal flex max-w-xs flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            onTransition(complete)
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
          >
            persona: <b>{completion.persona ?? 'n/a'}</b>
            <br />
            confidence:{' '}
            <b>
              {completion.confidence != null
                ? `${Math.round(completion.confidence * 100)}%`
                : 'n/a'}
            </b>
            <br />
            modifiers:{' '}
            <b>
              {completion.modifiers && completion.modifiers.length > 0
                ? completion.modifiers.join(', ')
                : 'none'}
            </b>
            <br />
            questions: <b>{completion.questions}</b>
          </Typography>
          <Button
            onClick={() => {
              setCompletion(null);
              setRunKey((key) => key + 1);
            }}
          >
            Replay
          </Button>
        </div>
      )}
    </div>
  );
}

PersonaQuizDemo.layoutProps = { seo };

export default PersonaQuizDemo;

import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import type { FunnelStepPersonaQuiz } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelPersonaQuiz } from '@dailydotdev/shared/src/features/onboarding/steps/FunnelPersonaQuiz';
import { NextSeo } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { buildSamplePersonaQuizStep } from '../../components/persona-quiz/personaQuizSampleConfig';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: 'Persona quiz preview',
  description:
    'Local preview of the onboarding persona quiz. Answers translate into feed tags.',
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
    site_name: 'daily.dev',
  },
  noindex: true,
  nofollow: true,
};

type CompletionPayload = Parameters<
  FunnelStepPersonaQuiz['onTransition']
>[0]['details'];

const PersonaQuizDevPage = (): ReactElement => {
  const [completion, setCompletion] = useState<CompletionPayload | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const onTransition = useCallback<FunnelStepPersonaQuiz['onTransition']>(
    ({ details }) => {
      if (details) {
        setCompletion(details);
      }
    },
    [],
  );

  const step = buildSamplePersonaQuizStep(onTransition);

  return (
    <>
      <NextSeo {...seo} />
      <main className="mx-auto flex min-h-dvh w-full flex-col items-center bg-background-default px-4 py-6 laptop:py-10">
        {completion ? (
          <section className="flex w-full max-w-md flex-col gap-4 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-6">
            <h2 className="font-bold text-text-primary typo-title3">
              Completion payload (would be sent to Freyja)
            </h2>
            <pre className="overflow-auto rounded-8 bg-background-default p-3 text-text-secondary typo-footnote">
              {JSON.stringify(completion, null, 2)}
            </pre>
            <button
              type="button"
              onClick={() => {
                setCompletion(null);
                setResetKey((k) => k + 1);
              }}
              className="self-start rounded-8 border border-border-subtlest-tertiary px-3 py-2 text-text-primary typo-callout hover:border-text-tertiary"
            >
              Run again
            </button>
          </section>
        ) : (
          <FunnelPersonaQuiz key={resetKey} {...step} />
        )}
      </main>
    </>
  );
};

export default PersonaQuizDevPage;

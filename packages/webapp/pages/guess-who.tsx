import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { GuessWhoQuiz } from '../components/guess-who/GuessWhoQuiz';
import { getLayout as getMainLayout } from '../components/layouts/MainLayout';
import { getPageSeoTitles } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Guess Who'),
  description:
    'Answer five quick questions and let daily.dev guess your developer persona.',
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
    site_name: 'daily.dev',
  },
};

const GuessWhoPage = (): ReactElement => (
  <main className="page mx-auto flex min-h-page w-full flex-col items-center justify-center px-6 py-10">
    <header className="mb-8 flex flex-col items-center gap-2 text-center">
      <h1 className="font-bold text-text-primary typo-mega3">
        Guess who you are
      </h1>
      <p className="max-w-[32rem] text-text-tertiary typo-body">
        Five quick questions and we&apos;ll take a (very humble) guess at your
        developer persona.
      </p>
    </header>
    <GuessWhoQuiz />
  </main>
);

GuessWhoPage.getLayout = getMainLayout;
GuessWhoPage.layoutProps = { screenCentered: false, seo };

export default GuessWhoPage;

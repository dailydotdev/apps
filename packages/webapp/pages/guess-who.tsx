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
    <GuessWhoQuiz />
  </main>
);

GuessWhoPage.getLayout = getMainLayout;
GuessWhoPage.layoutProps = { screenCentered: false, seo };

export default GuessWhoPage;

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { principles, researchPatterns } from './research';

const meta: Meta = {
  title: 'Hero Cover/Widgets/0. Brief & research',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const challenges = [
  [
    'Room',
    'People will add more widgets than one row holds. Do we refuse, page, stack, scroll, or let the system choose?',
  ],
  [
    'Money',
    'The hero carries our ad and our own promotions. Is that a fixed slot nobody can move, or a sponsored version of each widget?',
  ],
  [
    'Belonging',
    'It sits above the feed tabs on every visit. It has to read as part of daily.dev, not as a dashboard bolted on top.',
  ],
];

export const BriefAndResearch: StoryObj = {
  name: '0. Brief & research',
  render: () => (
    <Page
      chapter="Widgets · 0"
      question="What if the hero were yours?"
      title="The hero as a home screen of widgets"
      goal="Replace the fixed hero with widgets the reader picks, sizes and arranges, the way a phone or a Mac lets them, while keeping room for our ad and our own features."
      metric="Hero engagement per visit and return visits from readers who customized, with ad revenue per visit held flat."
    >
      <Case title="Three challenges">
        <div className="grid max-w-[72rem] grid-cols-1 gap-4 tablet:grid-cols-3">
          {challenges.map(([title, text]) => (
            <div
              key={title}
              className="flex flex-col gap-1 rounded-16 bg-surface-float p-4"
            >
              <span className="font-bold text-text-primary typo-callout">
                {title}
              </span>
              <span className="text-text-secondary typo-callout">{text}</span>
            </div>
          ))}
        </div>
      </Case>
      <Case
        title="What others do"
        note="Checked against the products themselves in October 2026. Each card links to its source."
      >
        <div className="grid max-w-[96rem] grid-cols-1 gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {researchPatterns.map((item) => (
            <a
              key={item.product}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4 transition-colors hover:bg-surface-hover"
            >
              <span className="font-bold text-text-primary typo-callout">
                {item.product}
              </span>
              <span className="text-text-secondary typo-footnote">
                {item.pattern}
              </span>
              <span className="mt-auto font-bold text-text-primary typo-footnote">
                → {item.lesson}
              </span>
            </a>
          ))}
        </div>
      </Case>
      <Case title="Twelve principles we take from it">
        <ol className="flex max-w-[56rem] list-decimal flex-col gap-2 pl-5 text-text-secondary typo-callout">
          {principles.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ol>
      </Case>
    </Page>
  ),
};

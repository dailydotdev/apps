import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Section } from '../onboarding-fixes/kit';
import { groups, unsourced } from './research';

const meta: Meta = {
  title: 'Startups Onboarding/7. Research',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

export const Research: StoryObj = {
  name: 'Research',
  render: () => (
    <Page
      eyebrow="Evidence"
      title="What the research says, and what it doesn't"
      intro="Every claim links to its source. Research means studies, Docs means vendor or standards guidance, Observed means we looked at the product on 4 Nov 2026. Most checkout research is e-commerce, so treat it as a guide and not a forecast. Confirm the Baymard back button, Userpilot and Supabase details at the source before quoting them, because those were read from search excerpts."
    >
      {groups.map(({ title, findings }) => (
        <Section key={title} title={title}>
          <ul className="flex flex-col gap-2">
            {findings.map(({ claim, source, url, kind }) => (
              <li
                key={claim}
                className="flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary p-3 tablet:flex-row tablet:items-start tablet:gap-4"
              >
                <span className="w-20 shrink-0 font-bold text-text-tertiary typo-caption1">
                  {kind}
                </span>
                <span className="min-w-0 flex-1 text-pretty text-text-secondary typo-callout">
                  {claim}
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-text-link underline typo-footnote"
                >
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ))}
      <Section
        title="Looked for and couldn't source"
        note="Nothing in this folder claims these."
      >
        <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
          {unsourced.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
    </Page>
  ),
};

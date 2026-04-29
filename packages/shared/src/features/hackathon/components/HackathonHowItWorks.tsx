import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import { anchorDefaultRel } from '../../../lib/strings';
import { webappUrl } from '../../../lib/constants';

type Section = {
  title: string;
  items: ReactNode[];
};

const sections: Section[] = [
  {
    title: 'Rules for all tracks',
    items: [
      'Public URL required. Must be deployed, not localhost.',
      'Every project produces something a user can share (image, card, page, link) with working OG/preview tags.',
      'No heavy onboarding. Connect an account or enter a query, get a result.',
      "Don't rebuild things we already have. DevCard, Presidential Briefing, Smart Prompts, Bookmark Folders, Custom Feeds, Reading Streaks, Top Reader, Cores. Build on top, not copies.",
    ],
  },
  {
    title: 'What we provide',
    items: [
      <>
        <Link
          key="public-api-docs"
          href="https://docs.daily.dev/docs/plus/public-api"
        >
          <a
            className="text-text-link underline"
            target="_blank"
            rel={anchorDefaultRel}
          >
            API
          </a>
        </Link>{' '}
        access for all registered participants (no Plus requirement).
      </>,
      <>
        <Link
          key="openapi-spec"
          href="https://api.daily.dev/public/v1/docs/json"
        >
          <a
            className="text-text-link underline"
            target="_blank"
            rel={anchorDefaultRel}
          >
            OpenAPI spec
          </a>
        </Link>{' '}
        for client generation in any language.
      </>,
      'Use whatever stack you want. Next.js, TanStack Start, Vite, Go, even PHP.',
      <>
        Agent skills like{' '}
        <Link key="daily-dev-ask" href={`${webappUrl}agents/ask`}>
          <a className="text-text-link underline">/daily-dev-ask</a>
        </Link>{' '}
        to help you out
      </>,
    ],
  },
  {
    title: 'Format & prizes',
    items: [
      '72 hours, async. Join from anywhere.',
      'To submit, post about your project on social media tagging @dailydotdev with your live URL and a short summary.',
      'Prizes: 1 year of daily.dev Plus with all the benefits for best submissions.',
      'Winning projects featured on daily.dev and social media.',
    ],
  },
];

export const HackathonHowItWorks = (): ReactElement => {
  return (
    <FlexCol className="w-full gap-7">
      <Typography type={TypographyType.Title3} bold center>
        How it works
      </Typography>
      <div className="flex flex-col gap-4 tablet:flex-row">
        {sections.map(({ title, items }) => (
          <FlexCol
            key={title}
            className="flex-1 gap-3 rounded-16 bg-surface-float p-5"
          >
            <Typography type={TypographyType.Callout} bold>
              {title}
            </Typography>
            <ul className="flex flex-col gap-2">
              {items.map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={index}>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Secondary}
                  >
                    • {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </FlexCol>
        ))}
      </div>
    </FlexCol>
  );
};

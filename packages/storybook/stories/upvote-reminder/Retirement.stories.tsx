import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import { MarketingCtaCard } from '@dailydotdev/shared/src/components/marketing/cta/MarketingCtaCard';
import type { MarketingCta } from '@dailydotdev/shared/src/components/marketing/cta/common';
import { MarketingCtaVariant } from '@dailydotdev/shared/src/components/marketing/cta/common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import ExtensionProviders from '../extension/_providers';
import { cardHandlers } from '../features/feed/feedHero.mocks';
import { realPosts } from '../hero-cover/realData';

// The "Upvote reminder" feed card is a Customer.io marketing CTA (campaign 15),
// not code: retiring it is a data change. This page shows the feed's first slot
// with the card and without it, on the production components.

const upvoteReminderCta: MarketingCta = {
  campaignId: '15',
  createdAt: new Date('2024-06-01T00:00:00.000Z'),
  variant: MarketingCtaVariant.Card,
  flags: {
    tagText: 'Pro tip',
    tagColor: 'avocado',
    title: 'Upvote or downvote your past reads',
    description:
      "Enhance your feed's accuracy by reviewing and voting the posts you've read so far.",
    ctaText: 'Review Your History',
    ctaUrl: '/history',
  },
};

const COLUMNS = 3;

const FeedGrid = ({ firstSlot }: { firstSlot?: ReactNode }): ReactElement => {
  const postCount = firstSlot ? COLUMNS * 2 - 1 : COLUMNS * 2;
  const posts = realPosts.slice(0, postCount);

  return (
    <div className="grid w-[60rem] grid-cols-3 gap-8 rounded-24 border border-border-subtlest-quaternary bg-background-default p-6">
      {firstSlot}
      {posts.map((post) => (
        <ArticleGrid key={post.id} post={post} {...cardHandlers} />
      ))}
    </div>
  );
};

const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <div className="flex max-w-[60rem] flex-col gap-1">
      <Typography type={TypographyType.Title3} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {note}
      </Typography>
    </div>
    {children}
  </section>
);

const reasons: { label: string; detail: string }[] = [
  {
    label: 'Almost nobody clicks it',
    detail: '1.8% of the people who saw it in the last 90 days clicked.',
  },
  {
    label: 'It nags',
    detail: 'The median extension user saw it 77 times.',
  },
  {
    label: 'It takes the first slot',
    detail:
      'It wins the first feed slot over the acquisition form, profile completion and brief cards.',
  },
  {
    label: 'Wrong audience',
    detail:
      'Half the people who see it joined 30+ days ago; only 2.4% of new signups see it.',
  },
  {
    label: 'Its promise moved',
    detail:
      "Since the History redesign (Oct 18) voting lives in each row's ⋯ menu, not on the row, so the card points at a flow that changed on purpose.",
  },
];

const firstSlotOrder = [
  'Plus entry card (non-Plus users)',
  'Marketing CTA card: the upvote reminder sits here today',
  'Acquisition form ("How did you hear about us?")',
  'Profile completion card',
  'Brief card',
  'Regular posts',
];

const BeforeAfter = (): ReactElement => (
  <ExtensionProviders>
    <div className="flex min-h-screen flex-col gap-10 bg-background-subtle p-8">
      <div className="flex max-w-[60rem] flex-col gap-4">
        <Typography type={TypographyType.LargeTitle} bold>
          Retire the &quot;Upvote reminder&quot; feed card
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          The card is Customer.io campaign 15 on the marketing CTA card variant.
          Removing it needs no code: stop the campaign and set the card row to
          inactive, and the first feed slot falls through to the next card in
          line.
        </Typography>
        <ul className="flex flex-col gap-2">
          {reasons.map((reason) => (
            <li key={reason.label} className="typo-callout">
              <strong>{reason.label}:</strong>{' '}
              <span className="text-text-secondary">{reason.detail}</span>
            </li>
          ))}
        </ul>
      </div>

      <Section
        title="Before"
        note="The upvote reminder takes the first feed slot (production MarketingCtaCard; the campaign image is left out)."
      >
        <FeedGrid
          firstSlot={<MarketingCtaCard marketingCta={upvoteReminderCta} />}
        />
      </Section>

      <Section
        title="After"
        note="With the campaign inactive, the first slot goes to the next eligible card, or to posts when nothing else is queued."
      >
        <FeedGrid />
      </Section>

      <Section
        title="Who gets the first slot"
        note="The order Feed.tsx checks, top to bottom. The first match wins."
      >
        <ol className="flex max-w-[60rem] list-decimal flex-col gap-1 pl-5 text-text-secondary typo-callout">
          {firstSlotOrder.map((item, index) => (
            <li
              key={item}
              className={
                index === 1 ? 'text-text-tertiary line-through' : undefined
              }
            >
              {item}
            </li>
          ))}
        </ol>
      </Section>
    </div>
  </ExtensionProviders>
);

const meta: Meta = {
  title: 'Growth/Upvote reminder retirement',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Overview: StoryObj = {
  name: 'Before and after',
  render: () => <BeforeAfter />,
};

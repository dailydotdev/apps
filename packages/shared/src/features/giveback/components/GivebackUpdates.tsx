import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useGivebackContext } from '../GivebackContext';
import { formatDonationAmount } from '../utils';

interface GivebackUpdate {
  id: string;
  tag: string;
  date: string;
  title: string;
  body: string;
}

// Campaign updates, Kickstarter-style — the running log of milestones, grants
// sent, and community moments. Swap for real posts/articles when they exist.
const updates: GivebackUpdate[] = [
  {
    id: 'update-halfway',
    tag: 'Milestone',
    date: 'May 28, 2026',
    title: 'We just crossed 50% funded',
    body: 'Halfway there. Every approved action this week pushed the meter past $5,000 — the first stretch goal is now within reach. Thank you for showing up.',
  },
  {
    id: 'update-grant',
    tag: 'Donation sent',
    date: 'May 20, 2026',
    title: 'First grant is on its way to Code.org',
    body: 'The community unlocked the first $2,500, and it’s already heading to Code.org to expand computer science education. Receipts will be shared in the Impact tab.',
  },
  {
    id: 'update-week-one',
    tag: 'Community',
    date: 'May 12, 2026',
    title: '1,000 developers joined in the first week',
    body: 'Giveback went from idea to a thousand backers in seven days. The most picked cause so far is open-source maintenance — your priorities are shaping where the money goes.',
  },
  {
    id: 'update-live',
    tag: 'Launch',
    date: 'May 5, 2026',
    title: 'Giveback is live',
    body: 'We’re redirecting our growth budget to the causes developers care about. No cost to you — just small actions that unlock real donations. Here’s to giving back together.',
  },
];

export const GivebackUpdates = (): ReactElement => {
  const { communityEvents, showCommunityFeed } = useGivebackContext();

  return (
    <FlexCol className="w-full gap-10">
      <FlexCol className="gap-2">
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Milestones, donations sent, and what&apos;s next.
        </Typography>

        <FlexCol className="divide-y divide-border-subtlest-tertiary">
          {updates.map((update) => (
            <FlexCol
              key={update.id}
              className="gap-2 py-5 transition-transform duration-200 first:pt-3 hover:translate-x-1 motion-reduce:transform-none"
            >
              <FlexRow className="items-center gap-2">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption2}
                  bold
                  className="rounded-8 bg-accent-cabbage-flat px-2 py-0.5 uppercase tracking-wider text-accent-cabbage-default"
                >
                  {update.tag}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {update.date}
                </Typography>
              </FlexRow>
              <Typography
                tag={TypographyTag.H3}
                type={TypographyType.Title3}
                bold
              >
                {update.title}
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                className="max-w-2xl"
              >
                {update.body}
              </Typography>
            </FlexCol>
          ))}
        </FlexCol>
      </FlexCol>

      <FlexCol className="gap-3">
        <FlexRow className="items-center justify-between gap-3">
          <Typography bold tag={TypographyTag.H3} type={TypographyType.Title3}>
            Live community activity
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            anonymized by default
          </Typography>
        </FlexRow>

        {showCommunityFeed && communityEvents.length ? (
          <FlexCol className="divide-y divide-border-subtlest-tertiary">
            {communityEvents.map((event) => (
              <FlexRow
                key={event.id}
                className="items-start justify-between gap-3 py-3"
              >
                <FlexCol className="gap-0.5">
                  <Typography bold type={TypographyType.Footnote}>
                    {event.actorLabel} {event.actionLabel}
                  </Typography>
                  {event.causeName && (
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                    >
                      Supporting {event.causeName}
                    </Typography>
                  )}
                </FlexCol>
                <Typography
                  bold
                  type={TypographyType.Footnote}
                  className="text-status-success"
                >
                  {event.amount
                    ? formatDonationAmount(event.amount, event.currency)
                    : 'Love'}
                </Typography>
              </FlexRow>
            ))}
          </FlexCol>
        ) : (
          <FlexCol className="items-center gap-1 py-10 text-center">
            <Typography bold type={TypographyType.Callout}>
              Community feed hidden
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Use the QA panel to show or hide anonymized community activity.
            </Typography>
          </FlexCol>
        )}
      </FlexCol>
    </FlexCol>
  );
};

import type { ReactElement } from 'react';
import React from 'react';
import { LimitedReachReason } from '../../../graphql/posts';
import { Pill, PillSize } from '../../Pill';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { anchorDefaultRel } from '../../../lib/strings';
import {
  getSquadManageUrl,
  SquadManageSection,
} from '../../../features/squads/lib/routes';

const docsUrl = 'https://docs.daily.dev/what-the-feed-recommends/';

const reasons: Record<
  Exclude<LimitedReachReason, LimitedReachReason.Locked>,
  { body: string; anchor: string }
> = {
  [LimitedReachReason.AiWritten]: {
    body: 'Developers here tend to skip posts that read as AI-written, so we expect limited reach for this one. Posts about what your team built, measured or got wrong usually go furthest.',
    anchor: 'ai-written',
  },
  [LimitedReachReason.Promotional]: {
    body: 'Developers come here to learn, and they tend to pass on posts that are mostly about a product, so we expect limited reach for this one. A how-to, a lesson learned or real numbers from building it usually does much better.',
    anchor: 'promotional',
  },
  [LimitedReachReason.OversoldTitle]: {
    body: "Developers here notice when a title promises more than the post delivers, so we expect limited reach for this one. A title that says plainly what they'll learn gets more clicks and upvotes.",
    anchor: 'oversold-title',
  },
  [LimitedReachReason.Language]: {
    body: 'Most developers here read in English, so this post reaches only readers who chose its language.',
    anchor: 'language',
  },
};

const lockedBody =
  "This post doesn't meet our content guidelines for the developer feed, so we expect limited reach for it. A paid plan tells you which guideline it misses and what to change.";

interface LimitedReachCardProps {
  reason: LimitedReachReason;
  squadHandle?: string;
}

export const LimitedReachCard = ({
  reason,
  squadHandle,
}: LimitedReachCardProps): ReactElement | null => {
  const isLocked = reason === LimitedReachReason.Locked;
  const copy = isLocked ? null : reasons[reason];
  const plansUrl =
    isLocked && squadHandle
      ? getSquadManageUrl(squadHandle, SquadManageSection.Plan)
      : null;

  if (!copy && !plansUrl) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
      <Pill
        label="daily.dev for Startups"
        size={PillSize.Small}
        className="bg-overlay-float-cabbage text-accent-cabbage-default"
      />
      <div className="flex flex-col gap-1">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          Limited reach expected
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {copy?.body ?? lockedBody}
        </Typography>
      </div>
      {copy ? (
        <Button
          tag="a"
          href={`${docsUrl}#${copy.anchor}`}
          target="_blank"
          rel={anchorDefaultRel}
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          className="self-start"
        >
          How to reach more developers
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            tag="a"
            href={plansUrl ?? undefined}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
          >
            See plans
          </Button>
          <Button
            tag="a"
            href={docsUrl}
            target="_blank"
            rel={anchorDefaultRel}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
          >
            Read the content guidelines
          </Button>
        </div>
      )}
    </section>
  );
};

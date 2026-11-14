import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../../graphql/posts';
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
import { BoostPostButton } from '../../../features/boost/BoostButton';
import { useCopyText } from '../../../hooks/useCopy';
import { anchorDefaultRel } from '../../../lib/strings';
import { Origin } from '../../../lib/log';

const docsUrl = 'https://docs.daily.dev/what-the-feed-recommends/';

const reasons: Record<LimitedReachReason, { body: string; anchor: string }> = {
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

export const reviewPrompt =
  'Use the daily.dev content review skill to review my next post before I publish it on daily.dev.';

interface LimitedReachCardProps {
  post: Post;
  reason: LimitedReachReason;
  canBoost: boolean;
}

export const LimitedReachCard = ({
  post,
  reason,
  canBoost,
}: LimitedReachCardProps): ReactElement | null => {
  const [, copyPrompt] = useCopyText(reviewPrompt);
  const copy = reasons[reason];

  if (!copy) {
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
          {copy.body}
        </Typography>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          tag="a"
          href={`${docsUrl}#${copy.anchor}`}
          target="_blank"
          rel={anchorDefaultRel}
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          What developers here respond to
        </Button>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={() =>
            copyPrompt({
              message: 'Prompt copied. Paste it into your coding agent.',
            })
          }
        >
          Review your next post
        </Button>
        {canBoost && reason !== LimitedReachReason.Language && (
          <BoostPostButton
            post={post}
            buttonProps={{ size: ButtonSize.Small }}
            origin={Origin.PostAnalytics}
          />
        )}
      </div>
    </section>
  );
};

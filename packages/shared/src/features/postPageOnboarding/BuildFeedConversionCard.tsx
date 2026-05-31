import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import { capitalize } from '../../lib/strings';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { onboardingGradientClasses } from '../../components/onboarding/common';
import { useAnonFeedTags } from './useAnonFeedTags';
import { BuildFeedAuthOptions } from './BuildFeedAuthOptions';

interface BuildFeedConversionCardProps {
  post: Post;
}

const MAX_CHIPS = 8;

/**
 * The anonymous right panel — focused on exactly two jobs: customize (pick
 * topics, pre-seeded from the article) and sign up (inline one-tap). Clean,
 * compact, and explicit, with nothing else competing for attention.
 */
export const BuildFeedConversionCard = ({
  post,
}: BuildFeedConversionCardProps): ReactElement => {
  const { chips, selectedTags, toggleTag } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: true,
  });

  return (
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
      <header className="flex flex-col gap-1">
        <Typography
          bold
          tag={TypographyTag.H2}
          type={TypographyType.Title3}
          className={onboardingGradientClasses}
        >
          Build your personalized feed
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          Pick your topics and get a daily feed of the dev content that matters.
          Free, forever.
        </Typography>
      </header>

      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Your topics
        </Typography>
        <div className="flex flex-wrap gap-1.5">
          {chips.slice(0, MAX_CHIPS).map((tag) => {
            const isSelected = selectedTags.includes(tag);
            if (isSelected) {
              return (
                <Button
                  key={tag}
                  type="button"
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Primary}
                  color={ButtonColor.Cabbage}
                  onClick={() => toggleTag(tag)}
                >
                  {capitalize(tag)}
                </Button>
              );
            }
            return (
              <Button
                key={tag}
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Float}
                onClick={() => toggleTag(tag)}
              >
                {capitalize(tag)}
              </Button>
            );
          })}
        </div>
      </div>

      <BuildFeedAuthOptions tags={selectedTags} origin="sidebar" />
    </div>
  );
};

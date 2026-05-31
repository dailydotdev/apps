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
  TypographyType,
} from '../../components/typography/Typography';
import { useAnonFeedTags } from './useAnonFeedTags';
import { BuildFeedAuthOptions } from './BuildFeedAuthOptions';

interface BuildFeedConversionCardProps {
  post: Post;
}

const MAX_CHIPS = 6;

/**
 * The anonymous right rail — deliberately calm and substance-first. No FOMO,
 * no fake proof, no animation: an honest one-line description of what
 * daily.dev is, the article's real topics presented as a quiet way to shape a
 * feed, and a single low-key signup. The value does the work, not the pitch.
 */
export const BuildFeedConversionCard = ({
  post,
}: BuildFeedConversionCardProps): ReactElement => {
  const { chips, selectedTags, toggleTag } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: true,
  });

  return (
    <aside className="flex flex-col gap-5 rounded-16 border border-border-subtlest-tertiary p-5">
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="font-mono uppercase tracking-wider"
        >
          daily.dev
        </Typography>
        <Typography bold type={TypographyType.Title3}>
          Keep up, without the noise
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          The best of the dev web — articles, tools, and discussions — in one
          feed you actually control.
        </Typography>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Shape it around this article
          </Typography>
          <div className="flex flex-wrap gap-1.5">
            {chips.slice(0, MAX_CHIPS).map((tag) => {
              if (selectedTags.includes(tag)) {
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
      )}

      <BuildFeedAuthOptions tags={selectedTags} origin="sidebar" />
    </aside>
  );
};

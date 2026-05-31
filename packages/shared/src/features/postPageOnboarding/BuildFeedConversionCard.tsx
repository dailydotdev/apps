import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { Tag } from '../../graphql/feedSettings';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { capitalize } from '../../lib/strings';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ClickableText } from '../../components/buttons/ClickableText';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { TagElement } from '../../components/tags/TagElement';
import { highlightsTitleGradientClassName } from '../../components/cards/highlight/common';
import { HighlightPostSidebarWidget } from '../../components/cards/highlight/HighlightPostSidebarWidget';
import { useAnonFeedTags } from './useAnonFeedTags';
import { useBuildFeedSignup } from './useBuildFeedSignup';
import { LivePulse } from './LivePulse';
import { FeedTastePreview } from './FeedTastePreview';

interface BuildFeedConversionCardProps {
  post: Post;
}

const MAX_CHIPS = 6;

const buildSubcopy = (chips: string[]): string => {
  if (chips.length === 0) {
    return 'Get a daily feed of the best dev content — handpicked for you, no noise.';
  }
  const primary = capitalize(chips[0]);
  const list = chips.slice(0, 3).map(capitalize).join(', ');
  return `Loving this ${primary} read? Get a daily feed of ${list} and more — the best dev content, picked for you.`;
};

/**
 * The single anonymous conversion surface in the right column. The whole
 * panel is one cohesive, tinted card: a benefit-led hero made relevant by the
 * article's own topics, a real-time activity pulse, no-password topic
 * following, a taste of the resulting feed, and the live dev pulse — all
 * driving one CTA.
 */
export const BuildFeedConversionCard = ({
  post,
}: BuildFeedConversionCardProps): ReactElement => {
  const { showLogin } = useAuthContext();
  const { triggerSignup } = useBuildFeedSignup();
  const { chips, selectedTags, previewTags, toggleTag } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: true,
  });

  return (
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <header className="flex flex-col gap-1.5">
        <Typography
          bold
          type={TypographyType.Title3}
          className={highlightsTitleGradientClassName}
        >
          Build your personalized feed
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {buildSubcopy(chips)}
        </Typography>
        <LivePulse post={post} />
      </header>

      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="uppercase"
        >
          Your topics · tap to tune
        </Typography>
        <div className="flex flex-wrap gap-2">
          {chips.slice(0, MAX_CHIPS).map((tag) => (
            <TagElement
              key={tag}
              tag={{ name: tag } as Tag}
              isSelected={selectedTags.includes(tag)}
              onClick={({ tag: clicked }) =>
                clicked.name && toggleTag(clicked.name)
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="w-full"
          onClick={() => triggerSignup(selectedTags, 'sidebar')}
        >
          Build my feed
        </Button>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          Already a member?{' '}
          <ClickableText
            tag="button"
            type="button"
            inverseUnderline
            onClick={() =>
              showLogin({
                trigger: AuthTriggers.PostPage,
                options: { isLogin: true },
              })
            }
          >
            Log in
          </ClickableText>
        </Typography>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-4">
        <FeedTastePreview
          tags={previewTags}
          currentPostId={post?.id}
          title="A taste of your feed"
          maxItems={3}
        />
        <HighlightPostSidebarWidget />
      </div>
    </div>
  );
};

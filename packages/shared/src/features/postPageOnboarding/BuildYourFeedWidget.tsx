import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { Tag } from '../../graphql/feedSettings';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
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
import { PostSignupWidget } from '../../components/post/PostSignupWidget';
import { useAnonPostOnboarding } from './useAnonPostOnboarding';
import { useAnonFeedTags } from './useAnonFeedTags';
import { useBuildFeedSignup } from './useBuildFeedSignup';
import { FeedTastePreview } from './FeedTastePreview';

interface BuildYourFeedWidgetProps {
  post: Post;
}

const MAX_CHIPS = 8;

/**
 * Anonymous post-page sidebar. Replaces the plain signup widget with a
 * personalized "build your feed" surface: social proof, no-password topic
 * following (seeded from the article's tags), a live taste of the resulting
 * feed, and a single benefit-framed CTA. Falls back to the existing
 * PostSignupWidget when the experiment is off so the slot is never empty.
 */
export const BuildYourFeedWidget = ({
  post,
}: BuildYourFeedWidgetProps): ReactElement | null => {
  const { isEnabled } = useAnonPostOnboarding();
  const { showLogin } = useAuthContext();
  const { triggerSignup } = useBuildFeedSignup();
  const { chips, selectedTags, previewTags, toggleTag } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: isEnabled,
  });

  if (!isEnabled) {
    // Experiment off → keep the existing behavior untouched.
    return <PostSignupWidget />;
  }

  const upvotes = post?.numUpvotes ?? 0;
  const comments = post?.numComments ?? 0;
  const proofParts = [
    upvotes > 0 && `${upvotes} upvote${upvotes === 1 ? '' : 's'}`,
    comments > 0 && `${comments} discussing`,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4">
      <header className="flex flex-col gap-1">
        <Typography
          bold
          type={TypographyType.Title3}
          className={highlightsTitleGradientClassName}
        >
          Build your personalized feed
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Join millions of developers on daily.dev.
          {proofParts.length > 0 && ` ${proofParts.join(' · ')} on this post.`}
        </Typography>
      </header>

      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Secondary}
        >
          Following {selectedTags.length || 'these'} topic
          {selectedTags.length === 1 ? '' : 's'} — tap to tune your feed
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

      <FeedTastePreview
        tags={previewTags}
        currentPostId={post?.id}
        title="Your feed is forming"
      />

      <div className="flex flex-col gap-2">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          className="w-full"
          onClick={() => triggerSignup(selectedTags, 'sidebar')}
        >
          Get my feed
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
    </div>
  );
};

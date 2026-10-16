import type { ReactElement } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import type { OnboardingTagProps } from '@dailydotdev/shared/src/components/tags/TagElement';
import { TagElement } from '@dailydotdev/shared/src/components/tags/TagElement';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import { getPostsForTag, usePickedTags } from '../../previewData';

const PEEK_POSTS = 2;
const TOUCH_PEEK_MS = 2600;

// Holds a peek open for the review frames, where nothing hovers.
const PinnedPeekContext = createContext<string | undefined>(undefined);

const TagPeekCard = ({ tag }: { tag: string }): ReactElement | null => {
  const posts = getPostsForTag(tag).slice(0, PEEK_POSTS);

  if (!posts.length) {
    return null;
  }

  return (
    <span className="flex w-72 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3 text-left shadow-2">
      <span className="font-bold text-text-tertiary typo-footnote">
        #{tag} this week
      </span>
      {posts.map((post) => (
        <span key={post.id} className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-text-tertiary typo-caption1">
            <SourceAvatar
              className="!mr-0"
              size={ProfileImageSize.Size16}
              source={post.source as Source}
            />
            {post.source?.name}
          </span>
          <span className="line-clamp-2 font-bold text-text-primary typo-callout">
            {post.title}
          </span>
        </span>
      ))}
    </span>
  );
};

// Hover peeks on a pointer; a tap that picks the tag peeks for a moment on
// touch, so the payoff lands on the chip the user just pressed.
const PeekTag = (props: OnboardingTagProps): ReactElement => {
  const { tag, isSelected, onClick } = props;
  const [isTapPeek, setIsTapPeek] = useState(false);
  const isPinned = useContext(PinnedPeekContext) === tag.name;

  useEffect(() => {
    if (!isTapPeek) {
      return undefined;
    }

    const timeout = setTimeout(() => setIsTapPeek(false), TOUCH_PEEK_MS);

    return () => clearTimeout(timeout);
  }, [isTapPeek]);

  return (
    <span className="group relative">
      <TagElement
        {...props}
        onClick={(value) => {
          setIsTapPeek(!isSelected);
          onClick(value);
        }}
      />
      <span
        className={classNames(
          'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transition-opacity duration-150',
          isTapPeek || isPinned
            ? 'opacity-100'
            : 'opacity-0 [@media(pointer:fine)]:group-hover:opacity-100',
        )}
        style={{ zIndex: 5 }}
      >
        <TagPeekCard tag={tag.name ?? ''} />
      </span>
    </span>
  );
};

export const TagPeek = ({
  onContinue,
  initialOpen,
}: VariantProps): ReactElement => {
  const { tags } = usePickedTags();

  return (
    <PinnedPeekContext.Provider value={initialOpen ? tags.at(-1) : undefined}>
      <TagStepFrame TagElement={PeekTag} onContinue={onContinue}>
        <p className="text-center text-text-tertiary typo-callout">
          <span className="[@media(pointer:coarse)]:hidden">
            Hover a tag to see what it brings to your feed.
          </span>
          <span className="hidden [@media(pointer:coarse)]:inline">
            Pick a tag to see what it brings to your feed.
          </span>
        </p>
      </TagStepFrame>
    </PinnedPeekContext.Provider>
  );
};

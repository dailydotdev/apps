import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import { getPostsForTag, usePickedTags } from '../../previewData';
import { MatchedTag, PreviewPostRow } from '../../PreviewKit';

const TOAST_MS = 4000;
const MAX_TOASTS = 2;

interface Toast {
  tag: string;
  post: Post;
}

export const PickToasts = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { tags } = usePickedTags();
  const previous = useRef<string[] | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const before = previous.current;
    previous.current = tags;
    const added = before
      ? tags.filter((tag) => !before.includes(tag))
      : (initialOpen && tags.slice(-1)) || [];
    const fresh = added.flatMap((tag) => {
      const [post] = getPostsForTag(tag);

      return post ? [{ tag, post }] : [];
    });

    if (fresh.length) {
      setToasts((current) => [...fresh, ...current].slice(0, MAX_TOASTS));
    }
  }, [tags, initialOpen]);

  useEffect(() => {
    if (!toasts.length || initialOpen) {
      return undefined;
    }

    const timeout = setTimeout(
      () => setToasts((current) => current.slice(0, -1)),
      TOAST_MS,
    );

    return () => clearTimeout(timeout);
  }, [toasts, initialOpen]);

  return (
    <TagStepFrame
      onContinue={onContinue}
      docked={
        <div aria-live="polite" className="flex flex-col gap-2">
          {toasts.map(({ tag, post }) => (
            <div
              key={`${tag}-${post.id}`}
              className="animate-rail-popup-in rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-3 shadow-2"
            >
              <p className="pt-3 text-text-tertiary typo-footnote">
                <MatchedTag tag={tag} /> adds posts like
              </p>
              <PreviewPostRow className="!pt-1" matchedTags={[]} post={post} />
            </div>
          ))}
        </div>
      }
    >
      <p className="text-center text-text-tertiary typo-callout">
        Every tag you pick shows a post it adds to your feed.
      </p>
    </TagStepFrame>
  );
};

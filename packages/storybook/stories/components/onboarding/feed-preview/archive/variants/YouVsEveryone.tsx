import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import type { PreviewPost } from '../../previewData';
import {
  getEveryonePosts,
  getPickMoreCopy,
  usePreviewFeed,
} from '../../previewData';
import { PreviewPostRow, PreviewTrigger } from '../../PreviewKit';

const LIST_SIZE = 4;

type Side = 'everyone' | 'you';

const Column = ({
  title,
  items,
  isMuted,
  onlyYours,
}: {
  title: string;
  items: PreviewPost[];
  isMuted?: boolean;
  onlyYours?: Set<string>;
}): ReactElement => (
  <section
    className={classNames(
      'flex min-w-0 flex-1 flex-col rounded-16 border p-4',
      isMuted
        ? 'border-border-subtlest-tertiary opacity-64'
        : 'border-brand-default',
    )}
  >
    <h2 className="font-bold typo-callout">{title}</h2>
    <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
      {items.map((item) => (
        <PreviewPostRow
          key={item.post.id}
          {...item}
          badge={
            onlyYours?.has(item.post.id) && (
              <span className="shrink-0 rounded-6 bg-brand-float px-1.5 font-bold text-brand-default typo-caption2">
                Only for you
              </span>
            )
          }
        />
      ))}
    </div>
  </section>
);

export const YouVsEveryone = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const isTablet = useViewSize(ViewSize.Tablet);
  const { posts, isReady, remaining } = usePreviewFeed();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [side, setSide] = useState<Side>('you');
  const isVisible = isOpen && isReady;
  const everyone = getEveryonePosts()
    .slice(0, LIST_SIZE)
    .map((post) => ({ post, matchedTags: [] }));
  const yours = posts.slice(0, LIST_SIZE);
  const everyoneIds = new Set(everyone.map(({ post }) => post.id));
  const onlyYours = new Set(
    yours.flatMap(({ post }) => (everyoneIds.has(post.id) ? [] : [post.id])),
  );

  return (
    <TagStepFrame isPreviewOpen={initialOpen} onContinue={onContinue}>
      <PreviewTrigger
        disabledLabel={getPickMoreCopy(remaining)}
        isDisabled={!isReady}
        isOpen={isVisible}
        label="Compare with a generic feed"
        onClick={() => setIsOpen((value) => !value)}
        posts={posts}
      />
      {isVisible && (
        <div className="flex w-full max-w-[56rem] flex-col gap-4">
          <p className="text-center text-text-secondary typo-callout">
            {onlyYours.size} of your top {LIST_SIZE} posts only show up because
            of the tags you picked.
          </p>
          {!isTablet && (
            <div className="flex self-center rounded-12 bg-surface-float p-1">
              {(['everyone', 'you'] as Side[]).map((value) => (
                <button
                  key={value}
                  className={classNames(
                    'rounded-10 px-4 py-1.5 font-bold typo-callout',
                    side === value
                      ? 'bg-background-default text-text-primary'
                      : 'text-text-tertiary',
                  )}
                  onClick={() => setSide(value)}
                  type="button"
                >
                  {value === 'you' ? 'Your feed' : 'Without tags'}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            {(isTablet || side === 'everyone') && (
              <Column isMuted items={everyone} title="Without tags" />
            )}
            {(isTablet || side === 'you') && (
              <Column items={yours} onlyYours={onlyYours} title="Your feed" />
            )}
          </div>
        </div>
      )}
    </TagStepFrame>
  );
};

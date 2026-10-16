import type { PointerEvent, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import type { PreviewPost } from '../../previewData';
import {
  getPickMoreCopy,
  getRelatedTag,
  usePreviewFeed,
} from '../../previewData';
import { MatchedTag, PreviewTrigger } from '../../PreviewKit';

const DECK_SIZE = 6;
const SWIPE_THRESHOLD = 96;
const EXIT_MS = 220;

type Verdict = 'more' | 'skip';

const DeckCard = ({
  item,
  depth,
  dragX,
  exiting,
}: {
  item: PreviewPost;
  depth: number;
  dragX: number;
  exiting?: Verdict;
}): ReactElement => {
  const exitX = exiting === 'more' ? 480 : -480;
  const x = exiting ? exitX : depth === 0 ? dragX : 0;
  const rotate = x / 24;

  return (
    <article
      className={classNames(
        'absolute inset-0 flex select-none flex-col gap-3 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-3 shadow-2',
        (exiting || dragX === 0) &&
          'transition-transform duration-200 ease-out',
      )}
      style={{
        zIndex: DECK_SIZE - depth,
        transform: `translate(${x}px, ${
          depth * 12
        }px) rotate(${rotate}deg) scale(${1 - depth * 0.04})`,
      }}
    >
      <Image
        alt=""
        className="pointer-events-none h-44 w-full rounded-16 object-cover"
        draggable={false}
        src={item.post.image}
        type={ImageType.Post}
      />
      <span className="px-1 text-text-tertiary typo-footnote">
        {item.post.source?.name} · <MatchedTag tag={item.matchedTags[0]} />
      </span>
      <h3 className="line-clamp-3 px-1 font-bold typo-title3">
        {item.post.title}
      </h3>
    </article>
  );
};

export const SwipeTune = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const { tags, posts, isReady, remaining } = usePreviewFeed();
  const { onFollowTags } = useTagAndSource({ origin: Origin.EditTag });
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [deck, setDeck] = useState<PreviewPost[]>([]);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [exiting, setExiting] = useState<Verdict>();
  const [added, setAdded] = useState<string[]>([]);
  const dragStart = useRef<number | null>(null);
  const isVisible = isOpen && isReady;

  useEffect(() => {
    if (isVisible && !deck.length) {
      setDeck(posts.slice(0, DECK_SIZE));
    }
  }, [isVisible, deck.length, posts]);

  const current = deck[index];
  const relatedTag = current && getRelatedTag(current.post, tags);

  const decide = (verdict: Verdict) => {
    if (!current || exiting) {
      return;
    }

    if (verdict === 'more' && relatedTag) {
      onFollowTags({ tags: [relatedTag] });
      setAdded((list) => [...list, relatedTag]);
    }

    setExiting(verdict);
    setTimeout(() => {
      setExiting(undefined);
      setDragX(0);
      setIndex((value) => value + 1);
    }, EXIT_MS);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== null) {
      setDragX(event.clientX - dragStart.current);
    }
  };
  const onPointerUp = () => {
    dragStart.current = null;

    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      decide(dragX > 0 ? 'more' : 'skip');
    } else {
      setDragX(0);
    }
  };

  const isDone = !!deck.length && index >= deck.length;

  return (
    <TagStepFrame isPreviewOpen={initialOpen} onContinue={onContinue}>
      <PreviewTrigger
        disabledLabel={getPickMoreCopy(remaining)}
        isDisabled={!isReady}
        isOpen={isVisible}
        label="Tune it with real posts"
        onClick={() => setIsOpen((value) => !value)}
        posts={posts}
      />
      {isVisible && (
        <section className="flex w-full max-w-[22rem] flex-col items-center gap-4">
          <p className="text-center text-text-tertiary typo-footnote">
            Swipe right for more like this, left to skip.
          </p>
          {isDone ? (
            <div className="flex h-[22rem] w-full flex-col items-center justify-center gap-2 rounded-24 border border-dashed border-border-subtlest-tertiary p-6 text-center">
              <span className="font-bold typo-title3">Your feed is tuned</span>
              <span className="text-text-secondary typo-callout">
                {added.length
                  ? `Added ${added
                      .map((tag) => `#${tag}`)
                      .join(', ')} from the posts you liked.`
                  : 'You kept your tags as they are.'}
              </span>
            </div>
          ) : (
            <div
              className="relative h-[22rem] w-full touch-none"
              onPointerCancel={onPointerUp}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {deck
                .slice(index, index + 3)
                .map((item, depth) => (
                  <DeckCard
                    key={item.post.id}
                    depth={depth}
                    dragX={dragX}
                    exiting={depth === 0 ? exiting : undefined}
                    item={item}
                  />
                ))
                .reverse()}
            </div>
          )}
          {!isDone && (
            <div className="flex w-full gap-3">
              <Button
                className="flex-1"
                onClick={() => decide('skip')}
                size={ButtonSize.Medium}
                variant={ButtonVariant.Float}
              >
                Skip
              </Button>
              <Button
                className="flex-1"
                onClick={() => decide('more')}
                size={ButtonSize.Medium}
                variant={ButtonVariant.Primary}
              >
                More like this
              </Button>
            </div>
          )}
          {!isDone && relatedTag && (
            <span className="-mt-2 text-text-tertiary typo-footnote">
              More like this also adds <MatchedTag tag={relatedTag} />
            </span>
          )}
          <span className="text-text-quaternary typo-caption1 tabular-nums">
            {Math.min(index + 1, deck.length)} of {deck.length}
          </span>
        </section>
      )}
    </TagStepFrame>
  );
};

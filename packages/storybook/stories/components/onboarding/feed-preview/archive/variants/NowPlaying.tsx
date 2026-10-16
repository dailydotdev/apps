import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import {
  ModalKind,
  ModalSize,
} from '@dailydotdev/shared/src/components/modals/common/types';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { TagStepFrame } from '../../TagStepFrame';
import type { VariantProps } from '../../TagStepFrame';
import { getPickMoreCopy, usePreviewFeed } from '../../previewData';
import { MatchedTag } from '../../PreviewKit';
import { PreviewList } from '../../PreviewKit';

const CYCLE_MS = 3500;
const CYCLE_POSTS = 8;

export const NowPlaying = ({ onContinue }: VariantProps): ReactElement => {
  const { posts, isReady, remaining, isRefreshing, freshIds } =
    usePreviewFeed();
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const cycle = posts.slice(0, CYCLE_POSTS);
  const current = cycle[index % Math.max(cycle.length, 1)];

  useEffect(() => setIndex(0), [posts]);

  useEffect(() => {
    if (!isReady || isOpen) {
      return undefined;
    }

    const interval = setInterval(
      () => setIndex((value) => value + 1),
      CYCLE_MS,
    );

    return () => clearInterval(interval);
  }, [isReady, isOpen]);

  return (
    <TagStepFrame
      onContinue={onContinue}
      docked={
        <button
          className="relative flex w-full items-center gap-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-3 py-2.5 text-left shadow-2 disabled:cursor-default"
          disabled={!isReady}
          onClick={() => setIsOpen(true)}
          type="button"
        >
          {isReady && current ? (
            <>
              <SourceAvatar
                className="!mr-0"
                size={ProfileImageSize.Medium}
                source={current.post.source as Source}
              />
              <span
                key={current.post.id}
                className="flex min-w-0 flex-1 animate-composer-in flex-col"
              >
                <span className="text-text-tertiary typo-caption1">
                  Up next in your feed ·{' '}
                  <MatchedTag tag={current.matchedTags[0]} />
                </span>
                <span className="truncate font-bold typo-callout">
                  {current.post.title}
                </span>
              </span>
              <ArrowIcon className="rotate-90 text-text-tertiary" />
              <span
                key={`bar-${current.post.id}`}
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-default"
                style={{
                  animation: `${CYCLE_MS}ms linear both now-playing-progress`,
                }}
              />
            </>
          ) : (
            <span className="flex-1 py-1.5 text-center text-text-tertiary typo-callout">
              {getPickMoreCopy(remaining)}
            </span>
          )}
        </button>
      }
    >
      <style>
        {`@keyframes now-playing-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}
      </style>
      {isOpen && (
        <Modal
          isDrawerOnMobile
          isOpen
          kind={ModalKind.FlexibleCenter}
          onRequestClose={() => setIsOpen(false)}
          size={ModalSize.Small}
        >
          <Modal.Header title="Up next in your feed" />
          <Modal.Body className="!pt-0">
            <PreviewList
              freshIds={freshIds}
              isRefreshing={isRefreshing}
              posts={posts}
              size={CYCLE_POSTS}
            />
          </Modal.Body>
        </Modal>
      )}
    </TagStepFrame>
  );
};

import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/onboarding/common';
import {
  cloudinaryPatchyFed,
  cloudinaryPatchyWaiting,
} from '@dailydotdev/shared/src/lib/image';
import { TagStepFrame } from './TagStepFrame';
import type { VariantProps } from './TagStepFrame';
import { usePickedTags, usePreviewFeed } from './previewData';
import { PreviewPostRow } from './PreviewKit';
import {
  TagProgressBar,
  TagProgressHeader,
  useMilestoneBurst,
} from './TagProgress';

const TAG_STEP_MS = 260;
const ROW_STEP_MS = 160;
const SETTLE_MS = 450;
const ROWS = 3;

// Real work stands behind every beat: tags are matched, then posts arrive.
// In production the rows would wait on the feed query, never on a timer alone.
const useBuildSequence = (tagCount: number) => {
  const [beat, setBeat] = useState(0);
  const total = tagCount + ROWS + 1;

  useEffect(() => {
    if (beat >= total) {
      return undefined;
    }

    const delay = beat < tagCount ? TAG_STEP_MS : ROW_STEP_MS;
    const timeout = setTimeout(
      () => setBeat((value) => value + 1),
      beat === total - 1 ? SETTLE_MS : delay,
    );

    return () => clearTimeout(timeout);
  }, [beat, tagCount, total]);

  return {
    matchedTags: Math.min(beat, tagCount),
    shownRows: Math.max(Math.min(beat - tagCount, ROWS), 0),
    isDone: beat >= total,
  };
};

const Patchy = ({ isFed }: { isFed: boolean }): ReactElement => (
  <div className="relative size-40">
    <img
      alt=""
      className={classNames(
        'absolute inset-0 size-full object-contain transition-[opacity,transform] duration-300 ease-out',
        isFed ? 'scale-90 opacity-0' : 'opacity-100',
      )}
      src={cloudinaryPatchyWaiting}
    />
    <img
      alt={isFed ? 'Patchy with his bone' : ''}
      className={classNames(
        'absolute inset-0 size-full object-contain transition-[opacity,transform] duration-500',
        isFed ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
      )}
      src={cloudinaryPatchyFed}
      style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    />
  </div>
);

const BuildOverlay = ({
  onContinue,
  onEditTags,
}: {
  onContinue: () => void;
  onEditTags: () => void;
}): ReactElement => {
  const { tags, posts } = usePreviewFeed();
  const pickOrder = [...tags].reverse();
  const { matchedTags, shownRows, isDone } = useBuildSequence(pickOrder.length);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center overflow-y-auto bg-background-default px-6 py-10"
      style={{ zIndex: 10 }}
    >
      <div className="flex w-full max-w-[27.5rem] flex-col items-center gap-5">
        <Patchy isFed={isDone} />
        <div className="flex flex-col items-center gap-2">
          <OnboardingHeadline>
            {isDone ? 'Your feed is ready!' : 'Building your feed'}
          </OnboardingHeadline>
          <p
            className={classNames(
              'text-center text-text-secondary typo-callout transition-opacity duration-300',
              !isDone && 'opacity-0',
            )}
          >
            {pickOrder.length} tags in. Patchy fetched {posts.length} posts for
            you this week.
          </p>
        </div>
        <TagProgressBar
          burstKey={isDone ? 1 : 0}
          caption={
            isDone
              ? 'Feed unlocked'
              : `Matching tag ${Math.min(
                  matchedTags + 1,
                  pickOrder.length,
                )} of ${pickOrder.length}`
          }
          className="max-w-[20rem]"
          count={matchedTags}
          max={pickOrder.length}
        />
        <div className="flex flex-wrap justify-center gap-2">
          {pickOrder.map((tag, index) => (
            <span
              key={tag}
              className={classNames(
                'flex items-center gap-1 rounded-10 border px-3 py-1 typo-callout transition-colors duration-200',
                index < matchedTags
                  ? 'border-brand-default text-text-primary'
                  : 'border-border-subtlest-tertiary text-text-quaternary',
              )}
            >
              {index < matchedTags && <VIcon className="text-brand-default" />}
              {`#${tag}`}
            </span>
          ))}
        </div>
        <div className="flex w-full flex-col divide-y divide-border-subtlest-tertiary">
          {posts.slice(0, shownRows).map((item) => (
            <PreviewPostRow
              key={item.post.id}
              className="animate-composer-in"
              {...item}
            />
          ))}
        </div>
        <div
          className={classNames(
            'flex w-full flex-col gap-3 transition-opacity duration-300',
            !isDone && 'pointer-events-none opacity-0',
          )}
        >
          <p className="text-center font-bold text-text-primary typo-body">
            Does this look like your feed?
          </p>
          <div className="flex w-full gap-3">
            <Button
              onClick={onEditTags}
              size={ButtonSize.Large}
              variant={ButtonVariant.Float}
            >
              Tune my tags
            </Button>
            <Button
              className="flex-1"
              onClick={onContinue}
              size={ButtonSize.Large}
              variant={ButtonVariant.Primary}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BuildMoment = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const [isBuilding, setIsBuilding] = useState(initialOpen);
  const { tags } = usePickedTags();
  const burstKey = useMilestoneBurst(tags.length);

  return (
    <>
      <TagStepFrame
        header={<TagProgressHeader burstKey={burstKey} count={tags.length} />}
        onContinue={() => setIsBuilding(true)}
      />
      {isBuilding && (
        <BuildOverlay
          onContinue={onContinue}
          onEditTags={() => setIsBuilding(false)}
        />
      )}
    </>
  );
};

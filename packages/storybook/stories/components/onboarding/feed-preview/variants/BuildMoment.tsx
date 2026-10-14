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
import { TagStepFrame } from '../TagStepFrame';
import type { VariantProps } from '../TagStepFrame';
import { usePreviewFeed } from '../previewData';
import { PreviewPostRow } from '../PreviewKit';

const TAG_STEP_MS = 220;
const ROW_STEP_MS = 140;
const SETTLE_MS = 500;
const ROWS = 4;

// Real work stands behind every beat: tags are matched, then posts arrive.
// In production the rows would wait on the feed query, never on a timer alone.
const useBuildSequence = (isRunning: boolean, tagCount: number) => {
  const [beat, setBeat] = useState(0);
  const total = tagCount + ROWS + 1;

  useEffect(() => {
    if (!isRunning || beat >= total) {
      return undefined;
    }

    const delay = beat < tagCount ? TAG_STEP_MS : ROW_STEP_MS;
    const timeout = setTimeout(
      () => setBeat((value) => value + 1),
      beat === total - 1 ? SETTLE_MS : delay,
    );

    return () => clearTimeout(timeout);
  }, [isRunning, beat, tagCount, total]);

  return {
    matchedTags: Math.min(beat, tagCount),
    shownRows: Math.max(Math.min(beat - tagCount, ROWS), 0),
    isDone: beat >= total,
  };
};

const BuildOverlay = ({
  onContinue,
}: {
  onContinue: () => void;
}): ReactElement => {
  const { tags, posts } = usePreviewFeed();
  const pickOrder = [...tags].reverse();
  const { matchedTags, shownRows, isDone } = useBuildSequence(
    true,
    pickOrder.length,
  );

  return (
    <div
      className="fixed inset-0 flex flex-col items-center overflow-y-auto bg-background-default px-6 py-12"
      style={{ zIndex: 10 }}
    >
      <div className="flex w-full max-w-[27.5rem] flex-col items-center gap-6">
        <OnboardingHeadline>
          {isDone ? 'Your feed is ready' : 'Building your feed'}
        </OnboardingHeadline>
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
              {index < matchedTags && <VIcon className="text-brand-default" />}#
              {tag}
            </span>
          ))}
        </div>
        <p className="text-text-tertiary tabular-nums typo-footnote">
          {shownRows
            ? `Found ${posts.length} posts this week from your tags`
            : 'Matching posts to your tags'}
        </p>
        <div className="flex w-full flex-col divide-y divide-border-subtlest-tertiary">
          {posts.slice(0, shownRows).map((item) => (
            <PreviewPostRow
              key={item.post.id}
              className="animate-composer-in"
              {...item}
            />
          ))}
        </div>
        <Button
          className={classNames(
            'w-full transition-opacity duration-300',
            !isDone && 'pointer-events-none opacity-0',
          )}
          onClick={onContinue}
          size={ButtonSize.Large}
          variant={ButtonVariant.Primary}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export const BuildMoment = ({
  onContinue,
  initialOpen = false,
}: VariantProps): ReactElement => {
  const [isBuilding, setIsBuilding] = useState(initialOpen);

  return (
    <>
      <TagStepFrame onContinue={() => setIsBuilding(true)} />
      {isBuilding && <BuildOverlay onContinue={onContinue} />}
    </>
  );
};

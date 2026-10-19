import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import type { Decision } from '../policy/rank';
import { FollowKind, getMainTopic, Lane, SourceMode } from '../policy/rank';
import { TopicMode } from '../policy/profile';
import { FeedAction, glossary } from '../policy/glossary';
import { Duration, durationOptions } from '../policy/timed';
import { usePersonalization } from './PersonalizationContext';
import { useFeedScreen } from './FeedScreenContext';
import { DurationPicker } from './controls';
import { ReasonLine } from './ExplainPanel';

interface Fix {
  id: string;
  title: string;
  effect: string;
  isTimed?: boolean;
  run: (duration: Duration) => void;
}

const durationSuffix = (duration: Duration): string =>
  duration === Duration.Ongoing
    ? ''
    : ` for ${durationOptions
        .find(({ value }) => value === duration)
        ?.label.replace('1 week', 'a week')}`;

/** The two or three changes most likely to fix why this post was here. */
const useFixes = (decision: Decision): Fix[] => {
  const store = usePersonalization();
  const { post } = decision;
  const tag = decision.best?.tag ?? getMainTopic(post);
  const source = post.source?.id
    ? { id: post.source.id, name: post.source.name ?? post.source.id }
    : undefined;
  const fixes: Fix[] = [];

  if (decision.lane === Lane.Popular && store.state.isFillingWithPopular) {
    fixes.push({
      id: 'filling',
      title: 'Stop popular fill-ins',
      effect:
        'A short feed stays short instead of topping up with popular posts.',
      run: () => store.setFilling(false),
    });
  }
  if (tag) {
    fixes.push({
      id: `topic:${tag}`,
      title: `${glossary[FeedAction.ShowLess].verb} #${tag}`,
      effect: glossary[FeedAction.ShowLess].effect,
      isTimed: true,
      run: (duration) => store.setTopicMode(tag, TopicMode.Demoted, duration),
    });
  }
  if (source) {
    fixes.push({
      id: `source:${source.id}`,
      title: `${glossary[FeedAction.ShowLess].verb} from ${source.name}`,
      effect:
        decision.followedBy === FollowKind.Source
          ? 'You follow it, so its posts keep coming, just lower.'
          : glossary[FeedAction.ShowLess].effect,
      isTimed: true,
      run: (duration) =>
        store.setSourceMode(source, SourceMode.Demoted, duration),
    });
  }
  if (fixes.length < 3) {
    fixes.push({
      id: 'post',
      title: 'Just remove this post',
      effect: glossary[FeedAction.HidePost].effect,
      run: () => store.fewerLikeThis(post.id),
    });
  }
  return fixes.slice(0, 3);
};

/**
 * What a downvote opens on the card: why the post was here and the likeliest
 * fixes, in place of the "Don't show me posts from..." tag picker.
 */
export const DownvoteFix = ({
  decision,
  isGrid,
  onClose,
}: {
  decision: Decision;
  isGrid: boolean;
  onClose: () => void;
}): ReactElement => {
  const store = usePersonalization();
  const { onExplainCard, onStopAskingAfterDownvote } = useFeedScreen();
  const fixes = useFixes(decision);
  const [duration, setDuration] = useState(Duration.Ongoing);
  const [done, setDone] = useState<{ message: string; canUndo: boolean }>();
  const explain = onExplainCard && (
    <Button
      type="button"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.XSmall}
      icon={<ArrowIcon className="rotate-90" />}
      iconPosition={ButtonIconPosition.Right}
      onClick={() => onExplainCard(decision.post.id)}
    >
      Explain my feed
    </Button>
  );

  return (
    <div
      className={classNames(
        'flex min-h-0 flex-1 flex-col gap-3 p-4',
        isGrid ? 'pt-3' : 'pt-4',
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 shrink flex-col gap-0.5">
          <span className="font-bold text-text-primary typo-callout">
            {done ? 'Got it' : 'Why you saw this'}
          </span>
          {!done && <ReasonLine decision={decision} isClamped />}
        </span>
        <CloseButton
          size={ButtonSize.Small}
          className="-mr-2 -mt-1"
          aria-label="Close"
          onClick={onClose}
        />
      </header>
      {done ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <p className="text-text-secondary typo-footnote">{done.message}</p>
          {done.canUndo && (
            <p className="text-text-tertiary typo-footnote">
              Your feed updates on the next refresh.
            </p>
          )}
          <div className="-mx-1.5 mt-auto flex items-center justify-between gap-2">
            {done.canUndo ? (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<UndoIcon />}
                onClick={() => {
                  store.undo();
                  setDone(undefined);
                }}
              >
                Undo
              </Button>
            ) : (
              <span />
            )}
            {explain}
          </div>
        </div>
      ) : (
        <>
          {fixes.some(({ isTimed }) => isTimed) && (
            <DurationPicker
              label="For how long"
              value={duration}
              onChange={setDuration}
            />
          )}
          <ul className="flex flex-col gap-1" aria-label="Fixes">
            {fixes.map((fix) => {
              const title = `${fix.title}${
                fix.isTimed ? durationSuffix(duration) : ''
              }`;
              return (
                <li key={fix.id}>
                  <button
                    type="button"
                    onClick={() => {
                      fix.run(duration);
                      setDone({
                        message: `${title}. ${fix.effect}`,
                        canUndo: true,
                      });
                    }}
                    className="flex w-full flex-col rounded-10 bg-surface-float px-3 py-1.5 text-left transition-colors hover:bg-surface-hover"
                  >
                    <span className="font-bold text-text-primary typo-footnote">
                      {title}
                    </span>
                    <span className="text-text-tertiary typo-caption1">
                      {fix.effect}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="-mx-1.5 mt-auto flex flex-wrap items-center justify-between gap-x-2">
            <span className="flex items-center">
              <Tooltip content="Tell us it breaks the rules: spam, broken, or harmful.">
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.XSmall}
                  onClick={() =>
                    setDone({
                      message: "Thanks for the report. We'll review this post.",
                      canUndo: false,
                    })
                  }
                >
                  Report
                </Button>
              </Tooltip>
              {onStopAskingAfterDownvote && (
                <Tooltip content="Downvotes stop opening this card. Your downvote stays.">
                  <Button
                    type="button"
                    variant={ButtonVariant.Tertiary}
                    size={ButtonSize.XSmall}
                    onClick={() => {
                      onStopAskingAfterDownvote();
                      onClose();
                    }}
                  >
                    Don&apos;t ask again
                  </Button>
                </Tooltip>
              )}
            </span>
            {explain}
          </div>
        </>
      )}
    </div>
  );
};

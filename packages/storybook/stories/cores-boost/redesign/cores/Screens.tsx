import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CoreIcon,
  MiniCloseIcon,
} from '@dailydotdev/shared/src/components/icons';
import { BoostIcon } from '@dailydotdev/shared/src/components/icons/Boost';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { bunPost, PostPage } from '../../real/pages';
import { stripArt } from './frame';

// The Cores flow screens in the new look: the nudge strip on your own post.
// The quest page and the award notification stay as production has them.

/** The real daily quests page, as in the Flows (the quest card is production) */
export { QuestScreen } from '../../flows/cores/screens';

/** On your own post, once the balance covers the smallest boost */
export const NudgeStrip = ({
  balance,
  onBoost,
  onClose,
  className,
}: {
  balance: number;
  onBoost: () => void;
  onClose?: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex min-h-16 items-center gap-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float pr-2',
      className,
    )}
  >
    <span className="hidden h-16 w-32 shrink-0 overflow-hidden tablet:block">
      <img
        src={stripArt}
        alt="Patchy riding a boost rocket"
        className="h-full w-auto max-w-none"
      />
    </span>
    <CoreIcon size={IconSize.Medium} className="ml-3 shrink-0 tablet:hidden" />
    <span className="flex min-w-0 flex-1 flex-col py-2">
      <span className="typo-callout">
        You have{' '}
        <strong className="tabular-nums">
          {formatCoresCurrency(balance)} Cores,
        </strong>
      </span>
      <span className="text-text-tertiary typo-footnote">
        enough to boost this post
      </span>
    </span>
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<BoostIcon />}
      onClick={onBoost}
      className="shrink-0"
    >
      Boost
    </Button>
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<MiniCloseIcon />}
      onClick={onClose}
      aria-label="Dismiss"
      className="shrink-0"
    />
  </div>
);

/** Your own post on the real post page, with the nudge where the strip goes */
export const OwnPostScreen = ({
  balance,
  onBoost,
  showNudge = true,
}: {
  balance: number;
  onBoost?: () => void;
  showNudge?: boolean;
}): ReactElement => {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <PostPage
      post={bunPost}
      banner={
        showNudge &&
        !isDismissed && (
          <NudgeStrip
            balance={balance}
            onBoost={() => onBoost?.()}
            onClose={() => setIsDismissed(true)}
          />
        )
      }
    />
  );
};

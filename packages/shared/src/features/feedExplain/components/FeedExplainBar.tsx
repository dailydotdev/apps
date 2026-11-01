import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { SortIcon } from '../../../components/icons/Sort';
import { FilterIcon } from '../../../components/icons/Filter';
import { useFeedSettingsAction } from '../../../components/filters/MyFeedHeading';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { Origin } from '../../../lib/log';
import { useForYouControls } from '../useFeedExplainMode';
import { useOpenFeedTune } from '../useOpenFeedTune';
import { useSetFeedExplain } from '../useSetFeedExplain';
import { WhatsOffBox } from './WhatsOffBox';

interface FeedExplainBarProps {
  /** Tune is open: the bar hides but keeps What's off's answer. */
  isHidden?: boolean;
}

/**
 * Debug mode's bar, floating at the bottom of For You: say what's off, Tune
 * the whole feed beside it, open Feed settings, or leave Debug.
 */
export const FeedExplainBar = ({
  isHidden,
}: FeedExplainBarProps): ReactElement => {
  const openTune = useOpenFeedTune(Origin.FeedExplain);
  const { onClick: openFeedSettings } = useFeedSettingsAction();
  const setIsExplaining = useSetFeedExplain(Origin.FeedExplain);
  const { version } = useForYouControls();
  // Beside the What's off input on a phone, Tune and Feed settings keep
  // only their icons.
  const isCompact = !useViewSize(ViewSize.Tablet);

  return (
    // On a phone it stands one bar above the shell's, on the shell's floor.
    <div
      hidden={isHidden}
      className={classNames(
        'pointer-events-none sticky bottom-[calc(var(--shell-floor)+4rem)] z-3 mt-8 w-full justify-center px-4 laptop:bottom-[calc(1rem+var(--sponsor-strip-height,0.75rem))]',
        isHidden ? 'hidden' : 'flex',
      )}
    >
      <WhatsOffBox
        version={version}
        isCompact={isCompact}
        className="pointer-events-auto"
      >
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<SortIcon />}
          aria-label={isCompact ? 'Tune' : undefined}
          onClick={() => openTune()}
        >
          {!isCompact && 'Tune'}
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<FilterIcon />}
          aria-label={isCompact ? 'Feed settings' : undefined}
          onClick={openFeedSettings}
        >
          {!isCompact && 'Feed settings'}
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={() => setIsExplaining(false)}
        >
          Done
        </Button>
      </WhatsOffBox>
    </div>
  );
};

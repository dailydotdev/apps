import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { SortIcon } from '../../../components/icons/Sort';
import { FilterIcon } from '../../../components/icons/Filter';
import { useFeedSettingsAction } from '../../../components/filters/MyFeedHeading';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { featureWhatsOff } from '../../../lib/featureManagement';
import { Origin } from '../../../lib/log';
import { useForYouControls } from '../useFeedExplainMode';
import { useOpenFeedTune } from '../useOpenFeedTune';
import { useSetFeedExplain } from '../useSetFeedExplain';
import { WhatsOffBox } from './WhatsOffBox';

/**
 * Debug mode's bar, floating at the bottom of For You: say what's off, Tune
 * the whole feed beside it, open Feed settings, or leave Debug.
 */
export const FeedExplainBar = (): ReactElement => {
  const openTune = useOpenFeedTune(Origin.FeedExplain);
  const { onClick: openFeedSettings } = useFeedSettingsAction();
  const setIsExplaining = useSetFeedExplain(Origin.FeedExplain);
  const { isAvailable, version } = useForYouControls();
  const { value: hasWhatsOff } = useConditionalFeature({
    feature: featureWhatsOff,
    shouldEvaluate: isAvailable,
  });
  const isTablet = useViewSize(ViewSize.Tablet);
  // Beside the What's off input on a phone, Tune and Feed settings keep
  // only their icons.
  const isCompact = hasWhatsOff && !isTablet;

  const actions = (
    <>
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
    </>
  );

  return (
    // On a phone it stands one bar above the shell's, on the shell's floor.
    <div className="pointer-events-none sticky bottom-[calc(var(--shell-floor)+4rem)] z-3 mt-8 flex w-full justify-center px-4 laptop:bottom-[calc(1rem+var(--sponsor-strip-height,0.75rem))]">
      {hasWhatsOff ? (
        <WhatsOffBox
          version={version}
          isCompact={isCompact}
          className="pointer-events-auto"
        >
          {actions}
        </WhatsOffBox>
      ) : (
        <div className="pointer-events-auto flex items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2 shadow-2">
          {actions}
        </div>
      )}
    </div>
  );
};

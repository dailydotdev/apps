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
import {
  QueryStateKeys,
  useQueryState,
} from '../../../hooks/utils/useQueryState';
import { Origin } from '../../../lib/log';
import { useOpenFeedTune } from '../useOpenFeedTune';

/**
 * Debug mode's bar, floating at the bottom of For You: Tune the whole feed
 * beside it, open Feed settings, or leave Debug.
 */
export const FeedExplainBar = (): ReactElement => {
  const openTune = useOpenFeedTune(Origin.FeedExplain);
  const { onClick: openFeedSettings } = useFeedSettingsAction();
  const [, setIsExplaining] = useQueryState({
    key: [QueryStateKeys.FeedExplain],
    defaultValue: false,
  });

  return (
    // On a phone it stands one bar above the shell's, on the shell's floor.
    <div className="pointer-events-none sticky bottom-[calc(var(--shell-floor)+4rem)] z-3 mt-8 flex w-full justify-center px-4 laptop:bottom-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2 shadow-2">
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<SortIcon />}
          onClick={() => openTune()}
        >
          Tune
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<FilterIcon />}
          onClick={openFeedSettings}
        >
          Feed settings
        </Button>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={() => setIsExplaining(false)}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

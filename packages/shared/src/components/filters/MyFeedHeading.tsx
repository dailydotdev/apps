import type { ReactElement } from 'react';
import React from 'react';
import { FilterIcon, PlusIcon } from '../icons';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { useActions, useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { FeedSettingsButton } from '../feeds/FeedSettingsButton';
import { useShortcutsUser } from '../../hooks/useShortcutsUser';

interface MyFeedHeadingProps {
  onOpenFeedFilters: () => void;
}

function MyFeedHeading({
  onOpenFeedFilters,
}: MyFeedHeadingProps): ReactElement {
  const { completeAction } = useActions();
  const { toggleShowTopSites } = useSettingsContext();
  const { isOldUserWithNoShortcuts, showToggleShortcuts } = useShortcutsUser();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);

  return (
    <>
      <FeedSettingsButton
        onClick={onOpenFeedFilters}
        className="mr-auto"
        size={ButtonSize.Medium}
        variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
        icon={<FilterIcon />}
        iconPosition={
          shouldUseListFeedLayout ? ButtonIconPosition.Right : undefined
        }
      >
        {!isMobile ? 'Feed settings' : null}
      </FeedSettingsButton>
      {showToggleShortcuts && (
        <Button
          size={ButtonSize.Medium}
          variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
          className="mr-auto"
          onClick={() => {
            if (isOldUserWithNoShortcuts) {
              completeAction(ActionType.FirstShortcutsSession);
              return;
            }
            toggleShowTopSites();
          }}
          icon={<PlusIcon />}
          iconPosition={
            shouldUseListFeedLayout ? ButtonIconPosition.Right : undefined
          }
        >
          Shortcuts
        </Button>
      )}
    </>
  );
}

export default MyFeedHeading;

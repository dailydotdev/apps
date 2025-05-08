import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
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
import { useShortcutsUser } from '../../features/shortcuts/hooks/useShortcutsUser';
import useCustomFeedHeader from '../../hooks/feed/useCustomFeedHeader';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { settingsUrl, webappUrl } from '../../lib/constants';
import { SharedFeedPage } from '../utilities';
import { useActiveFeedNameContext } from '../../contexts';

interface MyFeedHeadingProps {
  onOpenFeedFilters?: () => void;
}

function MyFeedHeading({
  onOpenFeedFilters,
}: MyFeedHeadingProps): ReactElement {
  const { push, pathname, query } = useRouter();
  const { completeAction } = useActions();
  const { toggleShowTopSites } = useSettingsContext();
  const { isOldUserWithNoShortcuts, showToggleShortcuts } = useShortcutsUser();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { customFeedPlacement } = useCustomFeedHeader();
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const { feedName } = useActiveFeedNameContext();

  const getSetttingsVariant = () => {
    if (customFeedPlacement) {
      return ButtonVariant.Tertiary;
    }

    return isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary;
  };

  const editFeedUrl = useMemo(() => {
    if (isCustomDefaultFeed && pathname === '/') {
      return `${webappUrl}feeds/${defaultFeedId}/edit`;
    }

    if (feedName === SharedFeedPage.Custom) {
      return `${webappUrl}feeds/${query.slugOrId}/edit`;
    }

    return `${settingsUrl}feed/general`;
  }, [defaultFeedId, feedName, isCustomDefaultFeed, pathname, query]);

  const onClick = useCallback(() => {
    onOpenFeedFilters?.();

    return push(editFeedUrl);
  }, [editFeedUrl, onOpenFeedFilters, push]);

  return (
    <>
      <FeedSettingsButton
        onClick={onClick}
        size={ButtonSize.Medium}
        variant={getSetttingsVariant()}
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

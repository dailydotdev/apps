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
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
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
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const { feedName } = useActiveFeedNameContext();
  // v2 layout (laptop) renders this button inside the floating-card
  // page-header strip alongside other slim actions; use the compact ghost
  // sizing so the strip stays consistent with the designer mock.
  const { isV2 } = useLayoutVariant();
  const isV2Compact = isV2;

  const editFeedUrl = useMemo(() => {
    if (isCustomDefaultFeed && pathname === '/') {
      return `${webappUrl}feeds/${defaultFeedId}/edit`;
    }

    if (feedName === SharedFeedPage.Custom) {
      return `${webappUrl}feeds/${query.slugOrId}/edit`;
    }

    return `${settingsUrl}/feed/general`;
  }, [defaultFeedId, feedName, isCustomDefaultFeed, pathname, query]);

  const onClick = useCallback(() => {
    onOpenFeedFilters?.();

    return push(editFeedUrl);
  }, [editFeedUrl, onOpenFeedFilters, push]);

  // Spread iconPosition conditionally — passing `iconPosition: undefined`
  // explicitly to Button breaks the strict-mode discriminated union
  // (Button requires `iconPosition: ButtonIconPosition` when paired with
  // `icon`).
  const iconPositionProps = shouldUseListFeedLayout
    ? { iconPosition: ButtonIconPosition.Right }
    : {};

  return (
    <>
      {isV2Compact ? (
        <FeedSettingsButton
          onClick={onClick}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          icon={<FilterIcon />}
          {...iconPositionProps}
        >
          {!isMobile ? 'Feed settings' : null}
        </FeedSettingsButton>
      ) : (
        <FeedSettingsButton
          onClick={onClick}
          size={ButtonSize.Medium}
          variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
          icon={<FilterIcon />}
          {...iconPositionProps}
        >
          {!isMobile ? 'Feed settings' : null}
        </FeedSettingsButton>
      )}
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
          {...iconPositionProps}
        >
          Shortcuts
        </Button>
      )}
    </>
  );
}

export default MyFeedHeading;

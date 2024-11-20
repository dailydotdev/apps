import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { FilterIcon, PlusIcon } from '../icons';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { useActions, useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import { getFeedName } from '../../lib/feed';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { checkIsExtension } from '../../lib/func';
import { ActionType } from '../../graphql/actions';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { FeedSettingsButton } from '../feeds/FeedSettingsButton';
import { useAuthContext } from '../../contexts/AuthContext';

interface MyFeedHeadingProps {
  onOpenFeedFilters: () => void;
}

function MyFeedHeading({
  onOpenFeedFilters,
}: MyFeedHeadingProps): ReactElement {
  const isExtension = checkIsExtension();
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();
  const { checkHasCompleted } = useActions();
  const { showTopSites, toggleShowTopSites, customLinks } =
    useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const feedName = getFeedName(router.pathname);
  const { isCustomFeed } = useFeedName({ feedName });
  let feedFiltersLabel = 'Feed settings';

  const hasNoShortcuts = !customLinks?.length && !showTopSites;
  const isOldUser =
    isAuthReady &&
    !!user?.createdAt &&
    new Date(user.createdAt) < new Date('2024-07-16');
  const canEnableShortcuts =
    isExtension &&
    hasNoShortcuts &&
    (isOldUser || checkHasCompleted(ActionType.FirstShortcutsSession));

  console.log({
    isOldUser,
    hasNoShortcuts,
    isExtension,
    canEnableShortcuts,
    customLinks,
    showTopSites,
  });

  if (isCustomFeed) {
    feedFiltersLabel = 'Edit tags';
  }

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
        {!isMobile ? feedFiltersLabel : null}
      </FeedSettingsButton>
      {canEnableShortcuts && (
        <Button
          size={ButtonSize.Medium}
          variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
          className="mr-auto"
          onClick={() => {
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

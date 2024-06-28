import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { FilterIcon, PlusIcon } from '../icons';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import {
  useActions,
  useConditionalFeature,
  useFeedLayout,
  useViewSize,
  ViewSize,
} from '../../hooks';
import { feature } from '../../lib/featureManagement';
import { getFeedName } from '../../lib/feed';
import { useFeedName } from '../../hooks/feed/useFeedName';
import { checkIsExtension } from '../../lib/func';
import { ActionType } from '../../graphql/actions';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { ShortcutsUIExperiment } from '../../lib/featureValues';
import { FeedSettingsButton } from '../feeds/FeedSettingsButton';

interface MyFeedHeadingProps {
  onOpenFeedFilters: () => void;
}

function MyFeedHeading({
  onOpenFeedFilters,
}: MyFeedHeadingProps): ReactElement {
  const isExtension = checkIsExtension();
  const router = useRouter();
  const { checkHasCompleted } = useActions();
  const { showTopSites, toggleShowTopSites } = useSettingsContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const feedName = getFeedName(router.pathname);
  const { isCustomFeed } = useFeedName({ feedName });
  const { value: shortcutsUIFeature } = useConditionalFeature({
    feature: feature.shortcutsUI,
    shouldEvaluate: isExtension,
  });
  const isShortcutsUIV1 = shortcutsUIFeature === ShortcutsUIExperiment.V1;
  let feedFiltersLabel = 'Feed settings';

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
      {isExtension &&
        checkHasCompleted(ActionType.FirstShortcutsSession) &&
        !showTopSites &&
        isShortcutsUIV1 && (
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

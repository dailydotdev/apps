import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FilterIcon } from '../icons';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { useFeedLayout, useViewSize, ViewSize } from '../../hooks';
import { FeedSettingsButton } from '../feeds/FeedSettingsButton';
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
  const isMobile = useViewSize(ViewSize.MobileL);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const { feedName } = useActiveFeedNameContext();

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
    push(editFeedUrl);
  }, [editFeedUrl, onOpenFeedFilters, push]);

  const buttonProps = {
    onClick,
    size: ButtonSize.Medium,
    variant: isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary,
    icon: <FilterIcon />,
    children: !isMobile ? 'Feed settings' : null,
  };

  return shouldUseListFeedLayout ? (
    <FeedSettingsButton
      {...buttonProps}
      iconPosition={ButtonIconPosition.Right}
    />
  ) : (
    <FeedSettingsButton {...buttonProps} />
  );
}

export default MyFeedHeading;

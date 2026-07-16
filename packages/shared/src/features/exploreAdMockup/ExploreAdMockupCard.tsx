import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useState } from 'react';
import classNames from 'classnames';
import {
  Card,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '../../components/cards/common/Card';
import {
  CardContent,
  CardImage as ListCardImage,
  CardTextContainer as ListCardTextContainer,
  CardTitle as ListCardTitle,
} from '../../components/cards/common/list/ListCard';
import FeedItemContainer from '../../components/cards/common/list/FeedItemContainer';
import AdLink from '../../components/cards/ad/common/AdLink';
import { AdFavicon } from '../../components/cards/ad/common/AdFavicon';
import { AdImage } from '../../components/cards/ad/common/AdImage';
import { AdvertiseLink } from '../../components/cards/ad/common/AdvertiseLink';
import { RemoveAd } from '../../components/cards/ad/common/RemoveAd';
import PostTags from '../../components/cards/common/PostTags';
import { ButtonSize, ButtonVariant } from '../../components/buttons/common';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { combinedClicks } from '../../lib/click';
import { TargetId } from '../../lib/log';
import type { Ad } from '../../graphql/posts';
import type { ResolvedCreative } from './types';
import { buildAd, getCreatives, pickCreative } from './creative';

type ExploreAdMockupCardProps = {
  isList?: boolean;
  // Feed position, used to spread consecutive slots across different creatives.
  feedIndex?: number;
  onLinkClick?: (ad: Ad) => unknown;
  // Force a specific creative (Storybook / tests). Omit for the randomizer.
  creative?: ResolvedCreative;
};

const Attribution = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'font-normal text-text-quaternary typo-footnote',
      className,
    )}
  >
    Promoted by {name}
  </div>
);

// The advertiser head card that replaces every ad slot on the Explore feed.
// Structure mirrors the real AdGrid/AdList so it reads as a native ad slot —
// including the "Advertise here" / "Remove" footer and NO CTA button (Carbon /
// EthicalAds feed ads have none; the whole card links to the campaign). It
// additionally always renders the tags and a "Promoted by {advertiser}"
// attribution. Brand + copy come from the resolved creative, randomized per
// mount unless one is passed in.
export const ExploreAdMockupCard = forwardRef<
  HTMLElement,
  ExploreAdMockupCardProps
>(function ExploreAdMockupCard(
  { isList = false, feedIndex = 0, onLinkClick, creative },
  forwardedRef,
): ReactElement | null {
  const { isPlus } = usePlusSubscription();
  const [base] = useState(() =>
    Math.floor(Math.random() * Math.max(getCreatives().length, 1)),
  );
  const chosen = creative ?? pickCreative(base + feedIndex);

  if (!chosen) {
    return null;
  }

  const { campaign, placement } = chosen;
  const { brand } = campaign;
  const ad = buildAd(chosen);

  if (isList) {
    return (
      <FeedItemContainer
        domProps={{}}
        ref={forwardedRef as Ref<HTMLElement>}
        data-testid="adItem"
        linkProps={{
          href: ad.link,
          target: '_blank',
          rel: 'noopener',
          title: ad.description,
          ...combinedClicks(() => onLinkClick?.(ad)),
        }}
      >
        <CardContent>
          <ListCardTextContainer className="mr-4 flex-1">
            <ListCardTitle className="!mt-0 typo-title3">
              <AdFavicon ad={ad} className="mx-0 !mt-0 mb-2" />
              {ad.description}
            </ListCardTitle>
            <PostTags post={{ tags: placement.tags }} />
            <Attribution name={brand.name} className="mt-2 block" />
          </ListCardTextContainer>
          <AdImage ad={ad} ImageComponent={ListCardImage} />
        </CardContent>
        <div className="z-1 flex items-center pt-2">
          <AdvertiseLink
            targetId={TargetId.AdCard}
            buttonStyle
            size={ButtonSize.Small}
          />
          <div className="ml-auto">
            {!isPlus && (
              <RemoveAd
                size={ButtonSize.Small}
                className="!font-normal typo-footnote"
              />
            )}
          </div>
        </div>
      </FeedItemContainer>
    );
  }

  return (
    <Card data-testid="adItem" ref={forwardedRef as Ref<HTMLElement>}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <AdFavicon ad={ad} className="mx-4" />
      <CardTextContainer className="flex-1">
        <CardTitle className="typo-title3">{ad.description}</CardTitle>
        <CardSpace />
        <PostTags post={{ tags: placement.tags }} className="!items-end" />
        <Attribution name={brand.name} />
      </CardTextContainer>
      <AdImage className="mx-1 mb-0" ad={ad} ImageComponent={CardImage} />
      <CardTextContainer className="!mx-1 my-1">
        <div className="flex items-center">
          <AdvertiseLink
            targetId={TargetId.AdCard}
            buttonStyle
            size={ButtonSize.Small}
          />
          <div className="ml-auto flex items-center gap-2">
            {!isPlus && (
              <RemoveAd
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                className="!font-normal typo-footnote"
              />
            )}
          </div>
        </div>
      </CardTextContainer>
    </Card>
  );
});

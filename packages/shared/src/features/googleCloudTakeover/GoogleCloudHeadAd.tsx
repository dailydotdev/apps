import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Card,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '../../components/cards/common/Card';
import AdLink from '../../components/cards/ad/common/AdLink';
import { AdImage } from '../../components/cards/ad/common/AdImage';
import { AdPixel } from '../../components/cards/ad/common/AdPixel';
import { AdFavicon } from '../../components/cards/ad/common/AdFavicon';
import { AdList } from '../../components/cards/ad/AdList';
import PostTags from '../../components/cards/common/PostTags';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { googleCloudAd } from './content';

type GoogleCloudHeadAdProps = {
  isList?: boolean;
  className?: string;
};

const noop = () => undefined;
const adFeedContext = { items: [], queryKey: ['gcp-takeover-ad'] };

// The Google Cloud ad slot. Built from the real ad sub-components so it reads
// like a production ad card, with takeover tweaks: the only attribution is
// "Promoted", styled to match the date / read-time metadata of organic post
// cards (no CTA button / "Advertise here" / "Remove").
// On list/mobile layout there's no hover, so fall back to the standard AdList.
export const GoogleCloudHeadAd = ({
  isList = false,
  className,
}: GoogleCloudHeadAdProps): ReactElement => {
  if (isList) {
    return (
      <ActiveFeedContext.Provider value={adFeedContext}>
        <AdList
          ad={googleCloudAd}
          index={0}
          feedIndex={0}
          onLinkClick={noop}
          domProps={{ className }}
        />
      </ActiveFeedContext.Provider>
    );
  }

  return (
    <ActiveFeedContext.Provider value={adFeedContext}>
      <Card className={classNames('group', className)} data-testid="adItem">
        <AdLink ad={googleCloudAd} onLinkClick={noop} />
        <AdFavicon ad={googleCloudAd} className="mx-4" />
        <CardTextContainer className="flex-1">
          <CardTitle className="typo-title3">
            {googleCloudAd.description}
          </CardTitle>
          <CardSpace />
          {/* Advertiser cards carry tag chips like organic cards (mirrors the
              real AdGrid's PostTags row). */}
          {!!googleCloudAd.matchingTags?.length && (
            <PostTags
              post={{ tags: googleCloudAd.matchingTags }}
              className="!items-end"
            />
          )}
          {/* Match the exact look of a post card's date / read-time line.
              No horizontal margin — CardTextContainer already applies mx-4, so
              this lines up flush-left with the title above it. */}
          <div className="flex min-w-0 items-center overflow-hidden text-text-tertiary typo-footnote">
            Promoted
          </div>
        </CardTextContainer>
        <AdImage
          className="!mx-0 !mb-0 !rounded-b-16 !rounded-t-none [&_img]:!rounded-none"
          ad={googleCloudAd}
          ImageComponent={CardImage}
        />
        <AdPixel pixel={googleCloudAd.pixel} />
      </Card>
    </ActiveFeedContext.Provider>
  );
};

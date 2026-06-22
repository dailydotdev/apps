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
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { combinedClicks } from '../../lib/click';
import { googleCloudAd } from './content';

type GoogleCloudHeadAdProps = {
  isList?: boolean;
  className?: string;
};

const noop = () => undefined;
const adFeedContext = { items: [], queryKey: ['gcp-takeover-ad'] };

// The Google Cloud ad slot. Built from the real ad sub-components so it reads
// like a production ad card, with takeover tweaks:
//  - the CTA ("Start building free") is hidden and revealed on hover in the
//    top-right corner (mirrors the post card's "Read post" hover affordance);
//  - the only attribution is "Promoted", styled to match the date / read-time
//    metadata of organic post cards (no "Advertise here" / "Remove").
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
          {/* Match the exact look of a post card's date / read-time line. */}
          <div className="mx-4 flex min-w-0 items-center overflow-hidden text-text-tertiary typo-footnote">
            Promoted
          </div>
        </CardTextContainer>
        <AdImage
          className="!mx-0 !mb-0 !rounded-b-16 !rounded-t-none [&_img]:!rounded-none"
          ad={googleCloudAd}
          ImageComponent={CardImage}
        />
        {!!googleCloudAd.callToAction && (
          <Button
            tag="a"
            href={googleCloudAd.link}
            target="_blank"
            rel="noopener"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="invisible absolute right-4 top-4 z-1 opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100"
            {...combinedClicks(noop)}
          >
            {googleCloudAd.callToAction}
          </Button>
        )}
        <AdPixel pixel={googleCloudAd.pixel} />
      </Card>
    </ActiveFeedContext.Provider>
  );
};

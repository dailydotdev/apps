import type { ReactElement } from 'react';
import React from 'react';
import { AdGrid } from '../../components/cards/ad/AdGrid';
import { AdList } from '../../components/cards/ad/AdList';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { googleCloudAd } from './content';

type GoogleCloudHeadAdProps = {
  isList?: boolean;
  className?: string;
};

const noop = () => undefined;

// The Google Cloud ad, rendered through the real AdGrid/AdList so it matches
// the live ad slot exactly. Wrapped in a minimal ActiveFeedContext so the
// auto-rotating-ads hook has a query key when rendered outside a live feed
// (rotation itself stays off unless the autorotate feature is enabled).
export const GoogleCloudHeadAd = ({
  isList = false,
  className,
}: GoogleCloudHeadAdProps): ReactElement => {
  const Card = isList ? AdList : AdGrid;

  return (
    <ActiveFeedContext.Provider
      value={{ items: [], queryKey: ['gcp-takeover-ad'] }}
    >
      <Card
        ad={googleCloudAd}
        index={0}
        feedIndex={0}
        onLinkClick={noop}
        domProps={{ className }}
      />
    </ActiveFeedContext.Provider>
  );
};

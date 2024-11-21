import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import {
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import {
  Card,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '../common/Card';
import AdLink from './common/AdLink';
import AdAttribution from './common/AdAttribution';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import type { AdCardProps } from './common/common';
import { RemoveAd } from './common/RemoveAd';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { apiUrl } from '../../../lib/config';
import type { Ad } from '../../../graphql/posts';
import { ActiveFeedContext } from '../../../contexts';
import { disabledRefetch } from '../../../lib/func';
import { useFeature } from '../../GrowthBookProvider';
import { featureAutorotateAds } from '../../../lib/featureManagement';

export const AdGrid = forwardRef(function AdGrid(
  { ad, onLinkClick, domProps, index, feedIndex }: AdCardProps,
  ref: (node?: Element | null) => void,
): ReactElement {
  const { isEnrolledNotPlus } = usePlusSubscription();
  const { logEventEnd } = useLogContext();
  const { queryKey: feedQueryKey } = useContext(ActiveFeedContext);
  const queryClient = useQueryClient();
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
  });

  const refs = useCallback(
    (node: HTMLElement) => {
      ref(node);
      inViewRef(node);
    },
    [inViewRef, ref],
  );

  const queryKey = useMemo(
    () => ['ads', ...[...(feedQueryKey || [])]],
    [feedQueryKey],
  );

  const autorotateAds = useFeature(featureAutorotateAds);

  const fetchNewAd = useCallback(async (): Promise<Ad> => {
    const res = await fetch(`${apiUrl}/v1/a?active=true`);
    const newAd: Ad = (await res.json())?.[0];
    if (!newAd) {
      return null;
    }

    // End the impression event for the old ad
    logEventEnd(generateAdLogEventKey(feedIndex));

    queryClient.setQueryData(
      queryKey,
      (currentData: InfiniteData<Ad, unknown>) => {
        const data = currentData;
        data.pages[index] = newAd;
        data.pageParams[index] = Date.now();
        return data;
      },
    );

    return newAd;
  }, [feedIndex, index, logEventEnd, queryClient, queryKey]);

  useQuery<Ad>({
    queryKey: [...queryKey, index],
    queryFn: fetchNewAd,
    enabled: !!autorotateAds,
    initialData: ad,
    staleTime: autorotateAds,
    refetchInterval: () => (inView ? autorotateAds : false),
    ...disabledRefetch,
  });

  return (
    <Card {...domProps} data-testid="adItem" ref={refs}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <CardTextContainer>
        <CardTitle className="my-4 line-clamp-4 font-bold typo-title3">
          {ad.description}
        </CardTitle>
      </CardTextContainer>
      <CardSpace />
      <AdImage ad={ad} ImageComponent={CardImage} />
      <CardTextContainer>
        {isEnrolledNotPlus ? (
          <div className="flex items-center pt-2.5">
            <AdAttribution ad={ad} />
            <RemoveAd />
          </div>
        ) : (
          <AdAttribution ad={ad} className={{ main: 'mb-2 mt-4' }} />
        )}
      </CardTextContainer>
      <AdPixel pixel={ad.pixel} />
    </Card>
  );
});

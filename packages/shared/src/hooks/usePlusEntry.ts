import { useMemo } from 'react';
import { MarketingCtaVariant } from '../components/marketingCta/common';
import type { MarketingCta } from '../components/marketingCta/common';
import { featurePlusEntryMobile } from '../lib/featureManagement';
import { useBoot } from './useBoot';
import { useConditionalFeature } from './useConditionalFeature';
import { useViewSize, ViewSize } from './useViewSize';

const usePlusEntry = (): {
  plusEntryFeed: MarketingCta | null;
  plusEntryBookmark: MarketingCta | null;
  plusEntryForYou: MarketingCta | null;
  plusEntryAnnouncementBar: MarketingCta | null;
} => {
  const { getPlusEntryData } = useBoot();
  const plusEntry = getPlusEntryData();
  const isMobile = useViewSize(ViewSize.MobileXL);
  const shouldEvaluate = isMobile && !!plusEntry;
  const { value: plusEntryExp } = useConditionalFeature({
    feature: featurePlusEntryMobile,
    shouldEvaluate,
  });
  const shouldShow = shouldEvaluate && plusEntryExp;

  return useMemo(() => {
    const getVariantEntry = (
      variant: MarketingCtaVariant,
    ): MarketingCta | null => {
      return shouldShow && plusEntry?.variant === variant ? plusEntry : null;
    };

    return {
      plusEntryFeed: getVariantEntry(MarketingCtaVariant.PlusCard),
      plusEntryBookmark: getVariantEntry(MarketingCtaVariant.PlusBookmarkTab),
      plusEntryForYou: getVariantEntry(MarketingCtaVariant.PlusForYouTab),
      plusEntryAnnouncementBar: getVariantEntry(
        MarketingCtaVariant.PlusAnnouncementBar,
      ),
    };
  }, [shouldShow, plusEntry]);
};

export default usePlusEntry;

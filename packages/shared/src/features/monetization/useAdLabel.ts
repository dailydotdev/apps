import { useFeature } from '../../components/GrowthBookProvider';
import { AdLabelVariant, featureAdLabel } from '../../lib/featureManagement';

interface UseAdLabel {
  /** Treatments disclose with a plain "Ad" instead of naming the advertiser. */
  hideAdvertiser: boolean;
  showAdvertiseLink: boolean;
}

export const useAdLabel = (): UseAdLabel => {
  const variant = useFeature(featureAdLabel);

  return {
    hideAdvertiser: !!variant && variant !== AdLabelVariant.Control,
    showAdvertiseLink: variant !== AdLabelVariant.AdOnly,
  };
};

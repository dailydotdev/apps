import { useFeature } from '../../components/GrowthBookProvider';
import { AdLabelVariant, featureAdLabel } from '../../lib/featureManagement';

interface UseAdLabel {
  /** Treatments disclose with a plain "Ad" instead of naming the advertiser. */
  hideAdvertiser: boolean;
  showAdvertiseLink: boolean;
  /**
   * The strictest arm keeps the card's own links but moves them off the card,
   * into an options menu. Only the glass card has the header room for it, so
   * the card pairs this with its own layout check.
   */
  isAdOnly: boolean;
}

export const useAdLabel = (): UseAdLabel => {
  const variant = useFeature(featureAdLabel);

  return {
    hideAdvertiser: !!variant && variant !== AdLabelVariant.Control,
    showAdvertiseLink: variant !== AdLabelVariant.AdOnly,
    isAdOnly: variant === AdLabelVariant.AdOnly,
  };
};

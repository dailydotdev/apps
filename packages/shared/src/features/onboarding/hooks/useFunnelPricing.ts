import { useMemo } from 'react';
import type { ProductPricingPreview } from '../../../graphql/paddle';
import { useProductPricingByIds } from '../../../hooks/useProductPricing';
import type {
  FunnelJSON,
  FunnelStepPricing,
  FunnelStepPricingPlan,
  FunnelStepPricingV2,
} from '../types/funnel';
import { FunnelStepType } from '../types/funnel';

export const useFunnelPricing = (
  funnel: FunnelJSON,
): { data: ProductPricingPreview[] } => {
  const step: FunnelStepPricing | FunnelStepPricingV2 = useMemo(
    () =>
      funnel.chapters
        .flatMap((chapter) => chapter.steps)
        .filter(
          (item) =>
            item.type === FunnelStepType.Pricing ||
            item.type === FunnelStepType.PricingV2,
        )
        .at(0),
    [funnel],
  );

  const plansArray: FunnelStepPricingPlan[] =
    step.type === FunnelStepType.Pricing
      ? step?.parameters?.plans
      : step?.parameters?.plansBlock?.plans;

  const { data } = useProductPricingByIds({
    ids: plansArray?.map((item) => item.priceId) ?? [],
  });

  const pricingPreview = useMemo(() => {
    if (!step) {
      return [];
    }

    return plansArray
      .map((plan) => {
        const preview = data?.find(
          (pricing) => pricing.priceId === plan.priceId,
        );

        if (!preview) {
          return null;
        }

        const hasBadge =
          !!plan.badge?.text?.trim()?.length && !!plan.badge?.background;

        return {
          ...preview,
          metadata: {
            title: plan.label,
            caption: hasBadge
              ? {
                  copy: plan.badge?.text,
                  color: plan.badge?.background,
                }
              : undefined,
            idMap: {
              paddle: plan.priceId,
            },
          },
        } as ProductPricingPreview;
      })
      .filter(Boolean);
  }, [data, plansArray, step]);

  return { data: pricingPreview ?? [] };
};

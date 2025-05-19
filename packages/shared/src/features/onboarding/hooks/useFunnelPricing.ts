import { useMemo } from 'react';
import type { ProductPricingPreview } from '../../../graphql/paddle';
import { useProductPricingByIds } from '../../../hooks/useProductPricing';
import type { FunnelJSON } from '../types/funnel';
import { FunnelStepType } from '../types/funnel';

export const useFunnelPricing = (
  funnel: FunnelJSON,
): { data: ProductPricingPreview[] } => {
  const step = useMemo(
    () =>
      funnel.chapters
        .flatMap((chapter) => chapter.steps)
        .find((item) => item.type === FunnelStepType.Pricing),
    [funnel],
  );

  const { data } = useProductPricingByIds({
    ids: step?.parameters?.plans?.map((item) => item.priceId) ?? [],
  });

  const pricingPreview = useMemo(() => {
    if (!step) {
      return [];
    }

    const plans = step.parameters.plans
      .map((plan) => {
        const preview = data?.find(
          (pricing) => pricing.priceId === plan.priceId,
        );

        if (!preview) {
          return null;
        }

        return {
          ...preview,
          metadata: {
            title: plan.label,
            caption: {
              copy: plan.badge?.text,
              color: plan.badge?.background,
            },
            idMap: {
              paddle: plan.priceId,
            },
          },
        } as ProductPricingPreview;
      })
      .filter(Boolean);

    return plans;
  }, [data, step]);

  return { data: pricingPreview ?? [] };
};

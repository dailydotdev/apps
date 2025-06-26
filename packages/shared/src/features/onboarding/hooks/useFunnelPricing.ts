import { useMemo } from 'react';
import type { ProductPricingPreview } from '../../../graphql/paddle';
import { useProductPricingByIds } from '../../../hooks/useProductPricing';
import type { FunnelJSON, FunnelStepPricing } from '../types/funnel';
import { FunnelStepType } from '../types/funnel';

export const useFunnelPricing = (
  funnel: FunnelJSON,
): { data: ProductPricingPreview[] } => {
  const step: FunnelStepPricing = useMemo(
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

    return (
      step?.parameters?.plans
        ?.map((plan) => {
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
        .filter(Boolean) ?? []
    );
  }, [data, step]);

  return { data: pricingPreview ?? [] };
};

import { useMemo } from 'react';
import { usePaymentContext } from '../../../contexts/payment/context';
import { PlusPriceTypeAppsId } from '../../../lib/featureValues';

export const useFunnelPlusPricing = () => {
  const { productOptions } = usePaymentContext();
  const item = useMemo(
    () =>
      productOptions?.find(
        ({ metadata }) => metadata.appsId === PlusPriceTypeAppsId.Annual,
      ),
    [productOptions],
  );

  return { item };
};

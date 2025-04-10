import type { type UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Paddle, PricePreviewResponse } from '@paddle/paddle-js';
import { useAuthContext } from '../../../contexts/AuthContext';

export type UsePaddlePricePreviewProps = {
  priceIds: string[];
  enabled?: boolean;
  paddle: Paddle | undefined;
};

export const usePaddlePricePreview = ({
  priceIds,
  enabled = true,
  paddle,
}: UsePaddlePricePreviewProps): UseQueryResult<PricePreviewResponse | null> => {
  const { geo } = useAuthContext();

  const getPricePreview = async () => {
    if (!paddle || !priceIds.length) {
      return null;
    }

    return paddle.PricePreview({
      items: priceIds.map((priceId) => ({
        priceId,
        quantity: 1,
      })),
      ...(geo?.region && {
        address: {
          countryCode: geo?.region,
        },
      }),
    });
  };

  return useQuery({
    queryKey: ['paddlePricePreview', priceIds, geo?.region],
    queryFn: getPricePreview,
    enabled: !!paddle && !!priceIds.length && enabled,
  });
};

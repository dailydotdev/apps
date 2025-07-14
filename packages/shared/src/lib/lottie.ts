import { disabledRefetch } from './func';
import { fromCDN } from './links';
import { generateQueryKey, RequestKey } from './query';

export const lottieAssetsBasePath = '/assets/lottie';

export const lottieAnimationQueryOptions = ({
  src,
  basePath = lottieAssetsBasePath,
}: {
  src: string;
  basePath?: string;
}) => {
  return {
    queryKey: generateQueryKey(
      RequestKey.LottieAnimations,
      null,
      basePath,
      src,
    ),
    queryFn: async () => {
      const animationPath = `${basePath}${src}`;

      const headers = new Headers();
      headers.set('Accept', 'application/json');

      const response = await fetch(fromCDN(animationPath), {
        headers,
        cache: 'force-cache',
      });

      if (!response.ok) {
        throw new Error(`Failed to load animation from ${animationPath}`);
      }

      const result = await response.json();

      return result;
    },
    ...disabledRefetch,
    staleTime: Infinity,
    gcTime: Infinity,
  };
};

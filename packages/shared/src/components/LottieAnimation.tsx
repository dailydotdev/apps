import React, { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LottieComponentProps } from 'lottie-react';
import type { ReactElement } from 'react';
import { RequestKey } from '../lib/query';
import { disabledRefetch } from '../lib/func';
import { fromCDN } from '../lib';

export type LottieAnimationProps = {
  className?: string;
  src: string;
  basePath?: string;
} & Omit<LottieComponentProps, 'animationData' | 'width' | 'height' | 'ref'>;

const Lottie = lazy(
  () => import(/* webpackChunkName: "lottieReact" */ 'lottie-react'),
);

export const LottieAnimation = ({
  className,
  src,
  basePath = '/assets/lottie',
  loop = true,
  autoplay = true,
  ...lottieProps
}: LottieAnimationProps): ReactElement => {
  const { data: animationData } = useQuery({
    queryKey: [RequestKey.LottieAnimations, basePath, src],
    queryFn: async () => {
      const animationPath = `${basePath}${src}`;

      const headers = new Headers();
      headers.set('Accept', 'application/json');

      const response = await fetch(fromCDN(animationPath), {
        headers,
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
  });

  return (
    <Suspense fallback={<div className={className} />}>
      <Lottie
        {...lottieProps}
        className={className}
        loop={loop}
        autoplay={autoplay}
        animationData={animationData}
      />
    </Suspense>
  );
};

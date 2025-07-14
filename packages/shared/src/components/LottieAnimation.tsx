import React, { lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LottieComponentProps } from 'lottie-react';
import type { ReactElement } from 'react';
import {
  lottieAnimationQueryOptions,
  lottieAssetsBasePath,
} from '../lib/lottie';

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
  basePath = lottieAssetsBasePath,
  loop = true,
  autoplay = true,
  ...lottieProps
}: LottieAnimationProps): ReactElement => {
  const { data: animationData } = useQuery(
    lottieAnimationQueryOptions({ src, basePath }),
  );

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

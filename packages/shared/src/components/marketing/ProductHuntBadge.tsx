import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export enum ProductHuntBadgeTheme {
  Light = 'light',
  Neutral = 'neutral',
  Dark = 'dark',
}

const productHuntPostId = '1278154';
const productHuntLaunchUrl =
  'https://www.producthunt.com/products/daily-dev/launches/daily-dev-now-for-your-agent?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-daily-dev-now-for-your-agent';

interface ProductHuntBadgeProps {
  theme?: ProductHuntBadgeTheme;
  className?: string;
}

export const ProductHuntBadge = ({
  theme = ProductHuntBadgeTheme.Neutral,
  className,
}: ProductHuntBadgeProps): ReactElement => (
  <a
    href={productHuntLaunchUrl}
    target="_blank"
    rel="noopener noreferrer"
    className={classNames('inline-flex', className)}
  >
    <img
      alt="daily.dev, now for your agent - Where agents discover what's next | Product Hunt"
      width={250}
      height={54}
      src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${productHuntPostId}&theme=${theme}`}
    />
  </a>
);

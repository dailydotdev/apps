import React from 'react';
import type { ReactElement } from 'react';
import type { BriefCardProps } from './BriefCard';
import { BriefCard } from './BriefCard';

export const BriefCardFeed = (
  props: Pick<BriefCardProps, 'targetId' | 'className'>,
): ReactElement => {
  return <BriefCard {...props} />;
};

export default BriefCardFeed;

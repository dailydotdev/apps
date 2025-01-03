import type { ReactElement } from 'react';
import React from 'react';
import { useDevCard } from '../../../hooks/profile/useDevCard';
import type { DevCardProps } from './DevCard';
import { DevCard } from './DevCard';

interface DevCardFetchWrapperProps extends Omit<DevCardProps, 'data'> {
  userId: string;
}

export function DevCardFetchWrapper({
  userId,
  ...props
}: DevCardFetchWrapperProps): ReactElement {
  const data = useDevCard(userId);

  if (!data) {
    return null;
  }

  return <DevCard data={data} {...props} />;
}

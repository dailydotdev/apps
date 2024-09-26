import React, { ReactElement } from 'react';
import { useDevCard } from '../../../hooks/profile/useDevCard';
import { DevCard, DevCardProps } from './DevCard';

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

import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Ad } from '../../../../graphql/posts';
import { getAdSlotLifecycle } from '../../../../features/monetization/adSlotLifecycle';
import { useAdSlotActions } from '../../../../features/monetization/useAdSlotActions';

interface AdSlotProps {
  ad: Ad;
  children: ReactElement;
}

const ConfiguredAdSlot = ({
  ad,
  children,
}: AdSlotProps): ReactElement | null => {
  const transition = useAdSlotActions(ad);
  const [state, setState] = useState<'pre-render' | 'post-render'>(() =>
    getAdSlotLifecycle(ad)?.on['pre-render']?.length
      ? 'pre-render'
      : 'post-render',
  );

  useEffect(() => {
    transition(state);
    if (state === 'pre-render') {
      setState('post-render');
    }
  }, [state, transition]);

  return state === 'post-render' ? children : null;
};

export const AdSlot = ({ ad, children }: AdSlotProps): ReactElement => {
  const lifecycle = getAdSlotLifecycle(ad);
  if (
    !lifecycle?.on['pre-render']?.length &&
    !lifecycle?.on['post-render']?.length
  ) {
    return children;
  }

  return (
    <ConfiguredAdSlot key={ad.generationId ?? ad.link} ad={ad}>
      {children}
    </ConfiguredAdSlot>
  );
};

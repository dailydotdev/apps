import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Ad } from '../../../../graphql/posts';
import { getAdSlotLifecycle } from '../../../../features/monetization/adSlotLifecycle';
import { useAdClickUrl } from '../../../../features/monetization/useAdClickUrl';
import { useAdSlotActions } from '../../../../features/monetization/useAdSlotActions';

interface AdSlotProps {
  ad: Ad;
  children: ReactElement;
  trackClicks?: boolean;
}

const ConfiguredAdSlot = ({
  ad,
  children,
  trackClicks = true,
}: AdSlotProps): ReactElement | null => {
  const transition = useAdSlotActions(ad);
  const href = useAdClickUrl(ad);
  const onClick = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }
    const link =
      event.target instanceof Element ? event.target.closest('a[href]') : null;
    const target = link?.getAttribute('href');
    if (
      target &&
      (link?.hasAttribute('data-ad-click') ||
        [
          href,
          ad.data?.source?.permalink,
          ad.data?.post?.commentsPermalink,
        ].includes(target))
    ) {
      transition('click');
    }
  };
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

  if (state !== 'post-render') {
    return null;
  }
  if (!trackClicks || !getAdSlotLifecycle(ad)?.on.click?.length) {
    return children;
  }
  return (
    <span
      className="contents"
      onClickCapture={onClick}
      onAuxClickCapture={onClick}
    >
      {children}
    </span>
  );
};

export const AdSlot = ({
  ad,
  children,
  trackClicks = true,
}: AdSlotProps): ReactElement => {
  const lifecycle = getAdSlotLifecycle(ad);
  if (
    !lifecycle?.on['pre-render']?.length &&
    !lifecycle?.on['post-render']?.length &&
    (!trackClicks || !lifecycle?.on.click?.length)
  ) {
    return children;
  }

  return (
    <ConfiguredAdSlot
      key={ad.generationId ?? ad.link}
      ad={ad}
      trackClicks={trackClicks}
    >
      {children}
    </ConfiguredAdSlot>
  );
};

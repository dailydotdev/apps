import type { DOMAttributes, MouseEvent, ReactElement } from 'react';
import React, { useEffect, useLayoutEffect } from 'react';
import type { Ad } from '../../../../graphql/posts';
import { getAdSlotLifecycle } from '../../../../features/monetization/adSlotLifecycle';
import { useAdClickUrl } from '../../../../features/monetization/useAdClickUrl';
import { useAdSlotActions } from '../../../../features/monetization/useAdSlotActions';
import { useAdLifecycle } from '../../../../features/monetization/useAdLifecycle';

export type AdSlotRootProps = Pick<
  DOMAttributes<HTMLElement>,
  'onClickCapture' | 'onAuxClickCapture'
>;

interface AdSlotProps {
  ad: Ad;
  children: (props: AdSlotRootProps) => ReactElement;
  trackClicks?: boolean;
}

const ConfiguredAdSlot = ({
  ad,
  children,
  trackClicks = true,
}: AdSlotProps): ReactElement => {
  const { isEnabled } = useAdLifecycle(!!ad.lifecycle);
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
  useLayoutEffect(() => {
    transition('pre-render');
  }, [transition]);

  useEffect(() => {
    transition('post-render');
  }, [transition]);

  return children(
    isEnabled && trackClicks && getAdSlotLifecycle(ad)?.on.click?.length
      ? { onClickCapture: onClick, onAuxClickCapture: onClick }
      : {},
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
    return children({});
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

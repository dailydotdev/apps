import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { useMobileAppFooterContext } from '../contexts/MobileAppFooterContext';
import { MobileAppFooterTrigger } from '../mobileAppFooter';

interface MobileAppFooterAnchorProps {
  className?: string;
  style?: CSSProperties;
}

// The tall top margin counts an anchor the reader already scrolled past as
// reached, so landing mid-page (a comment permalink) still triggers it.
const reachedMargin = '100000px 0px 0px 0px';

const Anchor = ({
  className,
  style,
}: MobileAppFooterAnchorProps): ReactElement => {
  const { reveal } = useMobileAppFooterContext();
  const { ref, inView } = useInView({ rootMargin: reachedMargin });

  useEffect(() => {
    if (inView) {
      reveal();
    }
  }, [inView, reveal]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={classNames('h-0', className)}
      style={style}
    />
  );
};

export const MobileAppFooterAnchor = (
  props: MobileAppFooterAnchorProps,
): ReactElement | null => {
  const { moment, isRevealed } = useMobileAppFooterContext();

  if (moment?.trigger !== MobileAppFooterTrigger.Anchor || isRevealed) {
    return null;
  }

  return <Anchor {...props} />;
};

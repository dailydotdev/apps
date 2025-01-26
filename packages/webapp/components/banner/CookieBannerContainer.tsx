import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { AcceptCookiesCallback } from '@dailydotdev/shared/src/hooks/useCookieConsent';

export interface CommonCookieBannerProps {
  onAccepted: AcceptCookiesCallback;
  onModalClose: () => void;
  onHideBanner: () => void;
}

interface CookieBannerContainerProps {
  children: ReactNode;
  className?: string;
}

export function CookieBannerContainer({
  children,
  className,
}: CookieBannerContainerProps): ReactElement {
  return (
    <div
      className={classNames(
        'fixed bottom-0 left-0 z-max flex w-full flex-col border-t border-border-subtlest-secondary bg-accent-pepper-subtlest text-text-secondary typo-footnote laptop:bottom-6 laptop:left-[unset] laptop:right-6 laptop:items-center laptop:rounded-16 laptop:border',
        className,
      )}
    >
      {children}
    </div>
  );
}

import React, { PropsWithChildren, ReactElement } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { WithClassNameProps } from '../utilities';
import { isDevelopment } from '../../lib/constants';

const checkSameSite = () => {
  const referrer = globalThis?.document?.referrer;
  const origin = globalThis?.window?.location.origin;

  if (!referrer) {
    return true; // empty referrer means you are from the same site
  }

  return (
    referrer === origin || origin === referrer.substring(0, referrer.length - 1) // remove trailing slash
  );
};

export function GoBackHeaderMobile({
  children,
  className,
}: PropsWithChildren<WithClassNameProps>): ReactElement {
  const router = useRouter();
  const canGoBack =
    !!globalThis?.history?.length && (checkSameSite() || isDevelopment);

  if (!canGoBack && !children) {
    return null;
  }

  return (
    <span
      className={classNames(
        'sticky top-0 z-postNavigation flex flex-row items-center border-b border-border-subtlest-tertiary bg-background-default px-4 py-2 tablet:hidden',
        className,
      )}
    >
      {canGoBack && (
        <Button
          icon={<ArrowIcon className="-rotate-90" />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={router.back}
          className={!canGoBack && 'invisible'}
        />
      )}
      {children}
    </span>
  );
}

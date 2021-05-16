import React, { ReactElement } from 'react';
import { cookiePolicy } from '@dailydotdev/shared/src/lib/constants';
import CookieIcon from '@dailydotdev/shared/icons/cookie.svg';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';
import styles from './CookieBanner.module.css';
import classNames from 'classnames';

export interface CookieBannerProps {
  onAccepted: () => void;
}

export default function CookieBanner({
  onAccepted,
}: CookieBannerProps): ReactElement {
  // const scrollThreshold = 10;

  const close = () => {
    // window.removeEventListener('scroll', onScroll, false);
    onAccepted();
  };

  // const onScroll = () => {
  //   if (window.pageYOffset > scrollThreshold) {
  //     close();
  //   }
  // };
  //
  // useEffect(() => {
  //   window.addEventListener('scroll', onScroll, false);
  // }, []);

  return (
    <div
      className={classNames(
        'fixed left-0 bottom-0 w-full flex flex-col py-4 pr-14 pl-4 text-theme-label-secondary bg-theme-bg-tertiary border-t border-theme-divider-secondary z-2 typo-footnote laptop:w-48 laptop:right-6 laptop:bottom-6 laptop:p-6 laptop:items-center laptop:text-center laptop:border laptop:rounded-2xl',
        styles.cookieBanner,
      )}
    >
      <ModalCloseButton onClick={close} />
      <CookieIcon
        className="hidden mb-4 text-theme-label-primary laptop:block"
        style={{ fontSize: '3.5rem' }}
      />
      <div>
        Our lawyers advised us to tell you that we use{' '}
        <a
          href={cookiePolicy}
          target="_blank"
          rel="noopener"
          className="no-underline contents"
          style={{ color: 'inherit' }}
        >
          cookies
        </a>{' '}
        to improve user experience.
      </div>
      <Button
        onClick={close}
        className="btn-primary mt-4 self-start laptop:self-stretch"
        buttonSize="small"
      >
        I like cookies
      </Button>
    </div>
  );
}

import React, { ReactElement } from 'react';
import { cookiePolicy } from '@dailydotdev/shared/src/lib/constants';
import CookieIcon from '@dailydotdev/shared/src/components/icons/Cookie';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';
import classNames from 'classnames';
import styles from './CookieBanner.module.css';

export interface CookieBannerProps {
  onAccepted: () => void;
}

export default function CookieBanner({
  onAccepted,
}: CookieBannerProps): ReactElement {
  const close = () => {
    onAccepted();
  };

  return (
    <div
      className={classNames(
        'fixed left-0 bottom-0 w-full flex flex-col py-4 pr-14 pl-4 text-theme-label-secondary bg-theme-bg-tertiary border-t border-theme-divider-secondary typo-footnote laptop:w-48 laptop:right-6 laptop:bottom-6 laptop:p-6 laptop:items-center laptop:text-center laptop:border laptop:rounded-2xl',
        styles.cookieBanner,
      )}
    >
      <ModalCloseButton onClick={close} />
      <CookieIcon
        size="xxxlarge"
        className="hidden laptop:block mb-4 text-theme-label-primary"
      />
      <div>
        Our lawyers advised us to tell you that we use{' '}
        <a
          href={cookiePolicy}
          target="_blank"
          rel="noopener"
          className="contents no-underline"
          style={{ color: 'inherit' }}
        >
          cookies
        </a>{' '}
        to improve user experience.
      </div>
      <Button
        onClick={close}
        className="self-start laptop:self-stretch mt-4 btn-primary"
        buttonSize="small"
      >
        I like cookies
      </Button>
    </div>
  );
}

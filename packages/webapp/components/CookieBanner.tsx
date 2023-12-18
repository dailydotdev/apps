import React, { ReactElement } from 'react';
import { cookiePolicy } from '@dailydotdev/shared/src/lib/constants';
import CookieIcon from '@dailydotdev/shared/src/components/icons/Cookie';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

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
    <div className="flex fixed laptop:right-6 bottom-0 laptop:bottom-6 left-0 flex-col laptop:items-center laptop:p-6 py-4 pr-14 pl-4 w-full laptop:w-48 laptop:text-center laptop:rounded-2xl laptop:border border-t text-theme-label-secondary bg-theme-bg-tertiary border-theme-divider-secondary typo-footnote z-[200] laptop:left-[unset]">
      <ModalCloseButton onClick={close} />
      <CookieIcon
        size={IconSize.XXLarge}
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
        className="self-start laptop:self-stretch mt-4"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
      >
        I like cookies
      </Button>
    </div>
  );
}

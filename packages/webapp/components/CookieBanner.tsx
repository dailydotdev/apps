import React, { ReactElement } from 'react';
import { cookiePolicy } from '@dailydotdev/shared/src/lib/constants';
import { CookieIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';

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
    <div className="fixed bottom-0 left-0 z-cookie flex w-full flex-col border-t border-theme-divider-secondary bg-theme-bg-tertiary py-4 pl-4 pr-14 text-theme-label-secondary typo-footnote laptop:bottom-6 laptop:left-[unset] laptop:right-6 laptop:w-48 laptop:items-center laptop:rounded-2xl laptop:border laptop:p-6 laptop:text-center">
      <ModalClose onClick={close} top="2" />
      <CookieIcon
        size={IconSize.XXLarge}
        className="mb-4 hidden text-theme-label-primary laptop:block"
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
        className="mt-4 self-start laptop:self-stretch"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
      >
        I like cookies
      </Button>
    </div>
  );
}

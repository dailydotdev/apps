import type { ReactElement } from 'react';
import React from 'react';
import { cookiePolicy } from '@dailydotdev/shared/src/lib/constants';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { CookieIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { CommonCookieBannerProps } from './CookieBannerContainer';
import { CookieBannerContainer } from './CookieBannerContainer';

export default function CookieBanner({
  onAccepted,
}: CommonCookieBannerProps): ReactElement {
  const onAcceptAll = () => onAccepted();

  return (
    <CookieBannerContainer className="py-4 pl-4 pr-14 laptop:w-48 laptop:p-6 laptop:text-center">
      <ModalClose onClick={onAcceptAll} top="2" />
      <CookieIcon
        size={IconSize.XXLarge}
        className="mb-4 hidden text-text-primary laptop:block"
      />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
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
      </Typography>
      <Button
        onClick={onAcceptAll}
        className="mt-4 self-start laptop:self-stretch"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
      >
        I like cookies
      </Button>
    </CookieBannerContainer>
  );
}

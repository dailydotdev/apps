import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ModalClose } from '@dailydotdev/shared/src/components/modals/common/ModalClose';
import { CookieIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import {
  cookiePolicy,
  termsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import {
  Typography,
  TypographyTag,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { otherGdprConsents } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import type { CommonCookieBannerProps } from './CookieBannerContainer';
import { CookieBannerContainer } from './CookieBannerContainer';

export default function CookieBanner({
  onAccepted,
  onModalClose,
  onHideBanner,
}: CommonCookieBannerProps): ReactElement {
  const { openModal } = useLazyModal();
  const { isGdprCovered } = useAuthContext();
  const onAcceptAll = () => onAccepted(otherGdprConsents);

  const onOpenModal = () => {
    onHideBanner();
    openModal({
      type: LazyModal.CookieConsent,
      props: { onAcceptCookies: onAccepted, onAfterClose: onModalClose },
    });
  };

  return (
    <CookieBannerContainer className="tablet:rounded-0 rounded-10 p-4 laptop:w-64">
      <div className="flex w-full flex-row items-center justify-between">
        <CookieIcon
          secondary
          size={IconSize.Small}
          className="hidden text-text-tertiary tablet:block"
        />
        {!isGdprCovered && (
          <ModalClose
            size={ButtonSize.Small}
            position="relative"
            onClick={() => onAccepted()}
            right="0"
          />
        )}
      </div>
      <div className="mt-2 flex flex-col gap-4">
        <span className="text-text-secondary" data-testid="cookie_content">
          This site uses cookies to enhance your experience. By continuing, you
          agree to our use of cookies as outlined in our{' '}
          <Typography
            tag={TypographyTag.Link}
            href={cookiePolicy}
            target="_blank"
            rel="noopener"
          >
            Privacy Policy
          </Typography>{' '}
          and{' '}
          <Typography
            tag={TypographyTag.Link}
            href={termsOfService}
            target="_blank"
            rel="noopener"
          >
            Terms of Service
          </Typography>
          .
        </span>
        <div className="flex flex-row gap-2">
          <Button
            onClick={onAcceptAll}
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            className="flex-1 tablet:flex-[unset]"
          >
            {isGdprCovered ? 'Accept all' : 'I understand'}
          </Button>
          {isGdprCovered && (
            <Button
              onClick={onOpenModal}
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
              className="flex-1 tablet:flex-[unset]"
            >
              Customize
            </Button>
          )}
        </div>
      </div>
    </CookieBannerContainer>
  );
}

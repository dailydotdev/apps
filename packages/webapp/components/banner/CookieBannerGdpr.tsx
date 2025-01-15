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
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { CommonCookieBannerProps } from './CookieBannerContainer';
import { CookieBannerContainer } from './CookieBannerContainer';

export default function CookieBannerGdpr({
  onAccepted,
}: CommonCookieBannerProps): ReactElement {
  const { openModal } = useLazyModal();
  const { isGdprCovered } = useAuthContext();
  const onAcceptAll = () => onAccepted(otherGdprConsents);

  return (
    <CookieBannerContainer className="p-4 laptop:w-64">
      <div className="flex w-full flex-row items-center justify-between">
        <CookieIcon
          secondary
          size={IconSize.Small}
          className="text-text-tertiary"
        />
        <ModalClose
          size={ButtonSize.Small}
          position="relative"
          onClick={onAcceptAll}
          right="0"
        />
      </div>
      <div className="mt-2 flex flex-col gap-4">
        <span className="text-text-secondary" data-testid="gdpr_content">
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
        <div className="flex flex-col gap-2 tablet:flex-row tablet:justify-between">
          <Button
            onClick={onAcceptAll}
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
          >
            {isGdprCovered ? 'Accept all' : 'I understand'}
          </Button>
          {isGdprCovered && (
            <Button
              onClick={() =>
                openModal({
                  type: LazyModal.CookieConsent,
                  props: { onAcceptCookies: onAccepted },
                })
              }
              size={ButtonSize.Small}
              variant={ButtonVariant.Float}
            >
              Customize
            </Button>
          )}
        </div>
      </div>
    </CookieBannerContainer>
  );
}

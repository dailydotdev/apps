import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
} from '../../../components/typography/Typography';
import { cookiePolicy, termsOfService } from '../../../lib/constants';
import { useAuthContext } from '../../../contexts/AuthContext';
import { otherGdprConsents } from '../../../hooks/useCookieBanner';
import { LazyModal } from '../../../components/modals/common/types';
import type { AcceptCookiesCallback } from '../../../hooks/useCookieConsent';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { ClickableText } from '../../../components/buttons/ClickableText';

export interface OnboardingCookieConsentProps {
  onAccepted: AcceptCookiesCallback;
  onModalClose: () => void;
  onHideBanner: () => void;
  className?: string;
}

export function CookieConsent({
  onAccepted,
  onHideBanner,
  onModalClose,
  className,
}: OnboardingCookieConsentProps): ReactElement {
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
    <div
      className={classNames(
        'flex w-full flex-col gap-2 bg-background-default px-4 py-3 text-text-secondary',
        className,
      )}
    >
      <span
        className="text-text-tertiary typo-caption2"
        data-testid="cookie_content"
      >
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
        <ClickableText
          onClick={onAcceptAll}
          defaultTypo={false}
          className="font-bold !text-text-primary typo-subhead"
        >
          {isGdprCovered ? 'Accept all' : 'I understand'}
        </ClickableText>
        {isGdprCovered && (
          <ClickableText
            onClick={onOpenModal}
            defaultTypo={false}
            className="typo-subhead"
          >
            Customize
          </ClickableText>
        )}
      </div>
    </div>
  );
}

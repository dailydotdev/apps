import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Typography, TypographyTag } from '../../typography/Typography';
import { Divider } from '../../utilities';
import { cookiePolicy } from '../../../lib/constants';
import type { AcceptCookiesCallback } from '../../../hooks/useCookieConsent';
import {
  GdprConsentKey,
  otherGdprConsents,
} from '../../../hooks/useCookieBanner';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { CookieConsentItem } from './CookieConsentItem';

interface CookieConsentModalProps extends ModalProps {
  onAcceptCookies: AcceptCookiesCallback;
}

const options = Object.values(GdprConsentKey).filter(
  (key) => key !== GdprConsentKey.Necessary,
);

export const CookieConsentModal = ({
  onAcceptCookies,
  ...modalProps
}: CookieConsentModalProps): ReactElement => {
  const { onRequestClose } = modalProps;

  const onAcceptPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    // get the form
    const formData = new FormData((e.target as HTMLInputElement).form);
    const formProps = Object.fromEntries(formData);
    const keys = Object.keys(formProps);
    const acceptedConsents = keys.filter(
      (key) =>
        formProps[key] === 'on' &&
        otherGdprConsents.includes(key as GdprConsentKey),
    );
    const rejectedConsents = options.filter(
      (option) => !acceptedConsents.includes(option),
    );
    onAcceptCookies(acceptedConsents, rejectedConsents);

    onRequestClose(null);
  };

  const onAcceptAll = (e: React.MouseEvent) => {
    onAcceptCookies(otherGdprConsents);
    onRequestClose(e);
  };

  const onRejectAll = (e: React.MouseEvent) => {
    onAcceptCookies(); // this will accept just the necessary ones
    onRequestClose(e);
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      className="min-h-[38.75rem]"
    >
      <Modal.Header title="Cookie preferences" />
      <Modal.Body>
        <Typography type={Typography.Type.Body} bold>
          We value your privacy
        </Typography>
        <Typography
          type={Typography.Type.Callout}
          color={Typography.Color.Tertiary}
          className="my-1"
        >
          We use cookies to personalize content, improve performance, and
          provide a better experience. Manage your preferences below.
        </Typography>
        <Typography
          type={Typography.Type.Callout}
          tag={TypographyTag.Link}
          href={cookiePolicy}
          target="_blank"
          rel="noopener"
        >
          Learn more about our Cookie Policy →
        </Typography>
        <Divider className="my-4 bg-border-subtlest-tertiary" />
        <form
          className="flex flex-col gap-4"
          id="consent_form"
          onSubmit={onAcceptPreferences}
        >
          {Object.values(GdprConsentKey).map((consent) => (
            <CookieConsentItem key={consent} consent={consent} />
          ))}
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={onAcceptAll}
          type="button"
        >
          Accept all
        </Button>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={onRejectAll}
          type="button"
        >
          Reject all
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onAcceptPreferences}
          form="consent_form"
          className="ml-auto"
          type="submit"
        >
          Save preferences
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CookieConsentModal;

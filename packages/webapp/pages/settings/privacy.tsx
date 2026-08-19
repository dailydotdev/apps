import type { ReactElement } from 'react';
import React, { useEffect } from 'react';

import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import {
  cookiePolicy,
  privacyPolicy,
  termsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import { GdprConsentKey } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { CookieConsentItem } from '@dailydotdev/shared/src/components/modals/user/CookieConsentItem';
import { useConsentCookie } from '@dailydotdev/shared/src/hooks/useCookieConsent';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { openIubendaPreferences } from '../../components/Iubenda';
import AccountContentSection from '../../components/layouts/SettingsLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo, noindexSeoProps } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Privacy'),
  ...noindexSeoProps,
};

const AccountInvitePage = (): ReactElement | null => {
  const router = useRouter();
  const { saveCookies } = useConsentCookie(GdprConsentKey.Marketing);
  // the modal's "Reject all" calls back with no arguments, meaning
  // "necessary only" — it has to run against the necessary key or a
  // refusal would write the marketing cookie instead
  const { saveCookies: saveConsentPreferences } = useConsentCookie(
    GdprConsentKey.Necessary,
  );
  const { user, isAuthReady } = useAuthContext();
  const { openModal } = useLazyModal();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user) {
      router.push('/');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, user]);

  if (!isAuthReady) {
    return null;
  }

  const onToggleMarketing = (value: boolean) => {
    if (value) {
      return saveCookies();
    }

    return saveCookies([], [GdprConsentKey.Marketing]);
  };

  const onManagePreferences = () => {
    if (openIubendaPreferences()) {
      return;
    }

    // iubenda blocked, still loading, or not applicable in this country:
    // the in-house modal still writes the first-party consent cookies
    openModal({
      type: LazyModal.CookieConsent,
      props: { onAcceptCookies: saveConsentPreferences },
    });
  };

  return (
    <AccountPageContainer title="Privacy">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="How we handle your data"
        description="We collect only what's needed and give you control over your information."
      >
        <Typography
          href={privacyPolicy}
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          target="_blank"
          rel="noopener"
        >
          Privacy Policy →
        </Typography>
      </AccountContentSection>
      {/* Not gated on `isGdprCovered`: iubenda collects consent under LGPD and
          USPR too, and withdrawal has to be as reachable as consent was. */}
      <AccountContentSection
        className={{ container: 'flex flex-col' }}
        title="Cookie preferences"
        description="Control how we use cookies on your device."
      >
        <Typography
          href={cookiePolicy}
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          target="_blank"
          rel="noopener"
        >
          Cookie Policy →
        </Typography>
        {!isIOSNative() ? (
          // the custom toggles can't regenerate a TCF consent string, so
          // consent edits must go through the CMP's own preferences UI;
          // the iOS native wrapper never loads iubenda and keeps them
          <Button
            className="mt-4 self-start"
            variant={ButtonVariant.Secondary}
            onClick={onManagePreferences}
          >
            Manage cookie preferences
          </Button>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <CookieConsentItem consent={GdprConsentKey.Necessary} />
            <CookieConsentItem
              consent={GdprConsentKey.Marketing}
              onToggle={onToggleMarketing}
            />
          </div>
        )}
      </AccountContentSection>
      <AccountContentSection
        title="Legal & support"
        className={{ container: 'flex flex-col gap-4' }}
      >
        <Typography
          href={termsOfService}
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          target="_blank"
          rel="noopener"
        >
          Terms of Service →
        </Typography>
        <Typography
          href={privacyPolicy}
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          target="_blank"
          rel="noopener"
        >
          Content guidelines →
        </Typography>
        <Typography
          href="mailto:hi@daily.dev"
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          target="_blank"
          rel="noopener"
        >
          Contact us →
        </Typography>
      </AccountContentSection>
    </AccountPageContainer>
  );
};

AccountInvitePage.getLayout = getSettingsLayout;
AccountInvitePage.layoutProps = { seo };

export default AccountInvitePage;

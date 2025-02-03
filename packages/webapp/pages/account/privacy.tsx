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
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Privacy'),
};

const AccountInvitePage = (): ReactElement => {
  const router = useRouter();
  const { saveCookies } = useConsentCookie(GdprConsentKey.Marketing);
  const { user, isAuthReady, isGdprCovered } = useAuthContext();

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

  return (
    <AccountPageContainer title="Privacy">
      <AccountContentSection
        className={{ heading: 'mt-0' }}
        title="Your privacy, our priority"
        description="We are committed to protecting your data and ensuring transparency in how we handle your information. Our approach prioritizes user control, minimal data collection, and secure practices to provide a seamless and privacy-conscious experience."
      >
        <Typography
          href={privacyPolicy}
          tag={TypographyTag.Link}
          type={TypographyType.Callout}
          target="_blank"
          rel="noopener"
        >
          Learn more about our Privacy Policy →
        </Typography>
      </AccountContentSection>
      {isGdprCovered && (
        <AccountContentSection
          className={{ container: 'flex flex-col' }}
          title="Cookie preferences"
          description="We use cookies to personalize content, improve performance, and provide a better experience. Manage your preferences below."
        >
          <Typography
            href={cookiePolicy}
            tag={TypographyTag.Link}
            type={TypographyType.Callout}
            target="_blank"
            rel="noopener"
          >
            Learn more about our Cookie Policy →
          </Typography>
          <div className="mt-4 flex flex-col gap-4">
            <CookieConsentItem consent={GdprConsentKey.Necessary} />
            <CookieConsentItem
              consent={GdprConsentKey.Marketing}
              onToggle={onToggleMarketing}
            />
          </div>
        </AccountContentSection>
      )}
      <AccountContentSection
        title="More links"
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
          href={privacyPolicy}
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

AccountInvitePage.getLayout = getAccountLayout;
AccountInvitePage.layoutProps = { seo };

export default AccountInvitePage;

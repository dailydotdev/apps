import type { ReactElement } from 'react';
import React, { useEffect } from 'react';

import type { NextSeoProps } from 'next-seo';
import { Typography } from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useRouter } from 'next/router';
import {
  cookiePolicy,
  privacyPolicy,
  termsOfService,
} from '@dailydotdev/shared/src/lib/constants';
import {
  GdprConsentKey,
  useConsentCookie,
} from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { CookieConsentItem } from '@dailydotdev/shared/src/components/modals/user/CookieConsentItem';
import AccountContentSection from '../../components/layouts/AccountLayout/AccountContentSection';
import { AccountPageContainer } from '../../components/layouts/AccountLayout/AccountPageContainer';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import { defaultSeo } from '../../next-seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const seo: NextSeoProps = { ...defaultSeo, title: getTemplatedTitle('Invite') };

const AccountInvitePage = (): ReactElement => {
  const router = useRouter();
  const [, onAcceptCookies, , exists] = useConsentCookie(
    GdprConsentKey.Marketing,
  );
  const { user, isGdprCovered, isAuthReady } = useAuthContext();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user || !isGdprCovered) {
      router.push('/');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthReady, isGdprCovered, user]);

  if (!isAuthReady) {
    return null;
  }

  const onToggle = (value: boolean) => {
    if (value) {
      return onAcceptCookies();
    }

    return onAcceptCookies([], [GdprConsentKey.Marketing]);
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
          tag={Typography.Tag.Link}
          type={Typography.Type.Callout}
          target="_blank"
          rel="noopener"
        >
          Learn more about our Privacy Policy →
        </Typography>
      </AccountContentSection>
      <AccountContentSection
        className={{ container: 'flex flex-col' }}
        title="Cookie preferences"
        description="We use cookies to personalize content, improve performance, and provide a better experience. Manage your preferences below."
      >
        <Typography
          href={cookiePolicy}
          tag={Typography.Tag.Link}
          type={Typography.Type.Callout}
          target="_blank"
          rel="noopener"
        >
          Learn more about our Cookie Policy →
        </Typography>
        <div className="mt-4 flex flex-col gap-4">
          <CookieConsentItem consent={GdprConsentKey.Necessary} />
          <CookieConsentItem
            consent={GdprConsentKey.Marketing}
            onToggle={onToggle}
          />
        </div>
      </AccountContentSection>
      <AccountContentSection
        title="More links"
        className={{ container: 'flex flex-col gap-4' }}
      >
        <Typography
          href={termsOfService}
          tag={Typography.Tag.Link}
          type={Typography.Type.Callout}
          target="_blank"
          rel="noopener"
        >
          Terms of Service →
        </Typography>
        <Typography
          href={privacyPolicy}
          tag={Typography.Tag.Link}
          type={Typography.Type.Callout}
          target="_blank"
          rel="noopener"
        >
          Content guidelines →
        </Typography>
        <Typography
          href={privacyPolicy}
          tag={Typography.Tag.Link}
          type={Typography.Type.Callout}
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

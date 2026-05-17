import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { LedgerPage } from '@dailydotdev/shared/src/features/inviteLedger/components/LedgerPage';
import { useInviteLedgerEnabled } from '@dailydotdev/shared/src/features/inviteLedger/useInviteLedgerEnabled';
import { setInviteLedgerDebugEnabled } from '@dailydotdev/shared/src/features/inviteLedger/debug';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { AccountPageContainer } from '../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seo: NextSeoProps = {
  ...defaultSeo,
  ...getPageSeoTitles('Referrals'),
};

const SettingsReferralsPage = (): ReactElement => {
  const isEnabled = useInviteLedgerEnabled();

  if (!isEnabled) {
    return (
      <AccountPageContainer title="Referrals">
        <div className="flex flex-col items-start gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6">
          <Typography type={TypographyType.Body} bold>
            The invite ledger is behind a feature flag.
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Enable the demo console to preview the ledger, the feed strip and
            the public profile counter on this preview environment.
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            onClick={() => {
              setInviteLedgerDebugEnabled(true);
              window.location.reload();
            }}
          >
            Enable demo
          </Button>
        </div>
      </AccountPageContainer>
    );
  }

  return (
    <AccountPageContainer title="Referrals">
      <LedgerPage />
    </AccountPageContainer>
  );
};

SettingsReferralsPage.getLayout = getSettingsLayout;
SettingsReferralsPage.layoutProps = { seo };

export default SettingsReferralsPage;

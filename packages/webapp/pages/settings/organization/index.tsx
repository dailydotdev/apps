import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { plusUrl } from '@dailydotdev/shared/src/lib/constants';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  getRoleName,
  HorizontalSeparator,
} from '@dailydotdev/shared/src/components/utilities';
import {
  ArrowIcon,
  OrganizationIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { InviteLinkInput } from '@dailydotdev/shared/src/components/referral';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import {
  ReferralCampaignKey,
  useReferralCampaign,
} from '@dailydotdev/shared/src/hooks';
import { link } from '@dailydotdev/shared/src/lib';
import { useOrganizations } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganizations';

import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import UserBadge from '@dailydotdev/shared/src/components/UserBadge';
import { AccountPageContainer } from '../../../components/layouts/SettingsLayout/AccountPageContainer';
import { getSettingsLayout } from '../../../components/layouts/SettingsLayout';
import { defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const NoOrganizations = () => {
  const { url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;

  return (
    <div className="flex flex-col gap-1 pt-6">
      <OrganizationIcon
        size={IconSize.XXXLarge}
        className="self-center text-text-tertiary"
      />

      <Typography bold center type={TypographyType.Title2}>
        No organization yet?
      </Typography>

      <Typography
        center
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        Ask your manager to create an organization and invite the team. Use the
        link below to make it easy. If you&apos;re lucky, they&apos;ll cover the
        cost too and you&apos;ll look like a hero for bringing it up.
      </Typography>

      <InviteLinkInput
        link={inviteLink}
        logProps={{
          event_name: LogEvent.CopyReferralLink,
          target_id: TargetId.OrganizationsPage,
        }}
        className={{ container: 'mt-6' }}
      />
    </div>
  );
};

const Page = (): ReactElement => {
  const { organizations } = useOrganizations();

  return (
    <AccountPageContainer
      title="Organizations"
      className={{ section: 'gap-6' }}
    >
      <section className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Organizations let your team unlock the full power of daily.dev Plus
          together including premium features, shared learning, and streamlined
          user management, all in one place. Create an organization using your
          company, team, or community name.
        </Typography>

        <Link href="#" passHref>
          <Typography
            tag={TypographyTag.Link}
            type={TypographyType.Callout}
            color={TypographyColor.Link}
          >
            Learn more about organizations at daily.dev →
          </Typography>
        </Link>
      </section>

      <Link href={plusUrl} passHref>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          className="self-start"
        >
          New organization
        </Button>
      </Link>

      <HorizontalSeparator />

      <section className="flex flex-col">
        <Typography bold type={TypographyType.Title3}>
          Your organization
        </Typography>

        {organizations && organizations.length > 0 ? (
          <div className="flex flex-col gap-4 pt-4">
            {organizations.map(({ role, organization }) => (
              <Link key={organization.id} href="#" passHref>
                <a className="flex items-center gap-2">
                  <Image
                    className="mr-2 size-8 rounded-full object-cover"
                    src={organization.image}
                    alt={`Avatar of ${organization.name}`}
                    type={ImageType.Organization}
                  />

                  <Typography
                    bold
                    type={TypographyType.Callout}
                    className="flex gap-1 self-center"
                  >
                    {organization.name}
                  </Typography>

                  <UserBadge role={role} className="mt-0.5">
                    {getRoleName(role)}
                  </UserBadge>

                  <ArrowIcon
                    size={IconSize.Small}
                    className="ml-auto rotate-90 text-text-tertiary"
                  />
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <NoOrganizations />
        )}
      </section>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Organizations'),
};

Page.getLayout = getSettingsLayout;
Page.layoutProps = { seo };

export default Page;

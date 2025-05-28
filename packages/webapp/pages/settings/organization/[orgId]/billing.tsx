import React from 'react';
import type { ReactElement } from 'react';
import type { NextSeoProps } from 'next-seo';

import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';

import { useOrganization } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganization';

import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { managePlusUrl } from '@dailydotdev/shared/src/lib/constants';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';

const Page = (): ReactElement => {
  const router = useRouter();
  const { openModal } = useLazyModal();

  const { organization, seats, isFetching } = useOrganization(
    router.query.orgId as string,
  );
  const { isAuthReady } = useAuthContext();

  if (isFetching || !isAuthReady) {
    return null;
  }

  return (
    <AccountPageContainer title="Billing" className={{ section: 'gap-6' }}>
      <section>
        <Typography bold type={TypographyType.Body} className="pb-4">
          Plan details
        </Typography>
        <Typography
          tag={TypographyTag.Ul}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="flex list-disc flex-col gap-1 pl-4"
        >
          <li>
            Your organization is on{' '}
            <Typography
              tag={TypographyTag.Span}
              color={TypographyColor.Primary}
              bold
            >
              daily.dev for teams (Annual)
            </Typography>
          </li>
          <li>
            You have{' '}
            <Typography
              tag={TypographyTag.Span}
              color={TypographyColor.Primary}
              bold
            >
              {seats.total} seats
            </Typography>{' '}
            <Typography
              tag={TypographyTag.Span}
              color={TypographyColor.Primary}
            >
              ({seats.assigned} allocated)
            </Typography>
          </li>
          <li>
            Your plan will renew on{' '}
            <Typography
              tag={TypographyTag.Span}
              color={TypographyColor.Primary}
              bold
            >
              April 13, 2025
            </Typography>
          </li>
        </Typography>
      </section>

      <HorizontalSeparator />

      <section>
        <Typography bold type={TypographyType.Body} className="pb-4">
          Plan summary
        </Typography>

        <div className="flex justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Typography type={TypographyType.Body}>
              daily.dev for teams
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {organization.seats} users x 12 months
            </Typography>
          </div>

          <div className="flex flex-col gap-1">
            <Typography bold type={TypographyType.Body}>
              $1,500
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              $25/seat
            </Typography>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 tablet:flex-row">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={() => {
            openModal({
              type: LazyModal.OrganizationManageSeats,
              props: {
                organizationId: organization.id,
              },
            });
          }}
        >
          Manage seats
        </Button>
        <Link href={managePlusUrl} passHref>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            tag="a"
          >
            Manage subscription
          </Button>
        </Link>
      </section>
    </AccountPageContainer>
  );
};

const seo: NextSeoProps = {
  ...defaultSeo,
  title: getTemplatedTitle('Organization'),
};

Page.getLayout = getOrganizationLayout;
Page.layoutProps = { seo };

export default Page;

import React, { useEffect, useState } from 'react';
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
import { useOrganizationSubscription } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganizationSubscription';
import { PlusPriceType } from '@dailydotdev/shared/src/lib/featureValues';
import { AccountPageContainer } from '../../../../components/layouts/SettingsLayout/AccountPageContainer';
import { defaultSeo } from '../../../../next-seo';
import { getTemplatedTitle } from '../../../../components/layouts/utils';
import { getOrganizationLayout } from '../../../../components/layouts/OrganizationLayout';

const Page = (): ReactElement => {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const organizationId = router.query.orgId as string;

  const { organization, seats, isFetching, isOwner } =
    useOrganization(organizationId);
  const { data: origData, nextBilling } = useOrganizationSubscription(
    organizationId,
    seats.total,
  );
  const { isAuthReady } = useAuthContext();

  const [data, setData] = useState(origData);

  const pricing = data?.pricing[0];

  useEffect(() => {
    if (data) {
      return;
    }

    setData(origData);
  }, [origData, data]);

  if (isFetching || !isAuthReady) {
    return null;
  }

  return (
    <AccountPageContainer
      title="Billing"
      className={{
        container: 'min-h-[30rem] tablet:min-h-[25rem]',
        section: 'flex-1 gap-6',
      }}
    >
      {data && (
        <>
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
                  daily.dev for teams (
                  {pricing.duration === PlusPriceType.Yearly
                    ? 'Annual'
                    : 'Monthly'}
                  )
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
                  {nextBilling}
                </Typography>
              </li>
            </Typography>
          </section>

          <HorizontalSeparator />

          <section>
            <Typography bold type={TypographyType.Body} className="pb-4">
              Plan summary
            </Typography>

            <div className="flex flex-col gap-0.5">
              <div className="flex flex-row items-center justify-between">
                <Typography type={TypographyType.Callout}>
                  daily.dev for teams
                </Typography>
                <Typography bold type={TypographyType.Body}>
                  {new Intl.NumberFormat(navigator.language, {
                    style: 'currency',
                    currency: pricing.currency.code,
                  }).format(data.total.amount)}
                </Typography>
              </div>

              <div className="flex flex-row items-center justify-between">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {seats.total} {seats.total === 1 ? 'user' : 'users'}{' '}
                  {pricing.duration === PlusPriceType.Yearly && 'x 12 months'}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {new Intl.NumberFormat(navigator.language, {
                    style: 'currency',
                    currency: pricing.currency.code,
                  }).format(pricing.price?.monthly?.amount)}
                  /seat
                </Typography>
              </div>
            </div>
          </section>
        </>
      )}

      <section className="mt-auto flex flex-col gap-4 tablet:flex-row">
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
          disabled={!isOwner}
        >
          Manage seats
        </Button>
        <Link href={managePlusUrl} passHref>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            tag="a"
            disabled={!isOwner}
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

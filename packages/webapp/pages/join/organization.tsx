import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { GET_ORGANIZATION_BY_ID_AND_INVITE_TOKEN_QUERY } from '@dailydotdev/shared/src/features/organizations/graphql';
import type { Author } from '@dailydotdev/shared/src/graphql/comments';
import type { Organization } from '@dailydotdev/shared/src/features/organizations/types';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useOrganization } from '@dailydotdev/shared/src/features/organizations/hooks/useOrganization';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { ReferralOriginKey } from '@dailydotdev/shared/src/lib/user';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { useRouter } from 'next/router';
import { getOrganizationSettingsUrl } from '@dailydotdev/shared/src/features/organizations/utils';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import Custom404Seo from '../404';

const Page = ({
  token,
  organization,
  user: member,
}: {
  token: string | null;
  organization: Omit<Organization, 'members'> | null;
  user: Author | null;
}): ReactElement => {
  const { push } = useRouter();
  const { showLogin, user, isAuthReady } = useAuthContext();
  const {
    organization: currentOrganization,
    isFetching,
    joinOrganization,
    isJoiningOrganization,
  } = useOrganization(organization.id, {
    retry: false,
  });

  const onJoinClick = () => {
    if (user) {
      joinOrganization(token);
      return;
    }

    showLogin({
      trigger: AuthTriggers.Organization,
      options: {
        referral: member.id,
        referralOrigin: ReferralOriginKey.Organization,
      },
    });
  };

  useEffect(() => {
    if (currentOrganization?.id === organization.id) {
      push(getOrganizationSettingsUrl(organization.id, 'members'));
    }
  }, [currentOrganization?.id, organization.id, push]);

  useEffect(() => {
    document.body.classList.add('hidden-scrollbar');

    return () => {
      document.body.classList.remove('hidden-scrollbar');
    };
  }, []);

  if (isFetching || !isAuthReady) {
    return null;
  }

  if (!token || !organization || !member) {
    return (
      <>
        <Custom404Seo />
      </>
    );
  }

  const seats = {
    available: (organization?.seats || 0) - (organization?.activeSeats || 0),
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="squad-background-fade absolute -top-4 left-0 right-0 h-40 max-w-[100vw] rounded-26 tablet:-left-20 tablet:-right-20" />
      <Logo
        position={LogoPosition.Relative}
        className="mb-auto pt-10"
        logoClassName={{ container: 'h-8' }}
      />

      <div className="mb-auto flex max-w-[40rem] flex-col gap-6 p-6">
        <Typography bold tag={TypographyTag.H1} type={TypographyType.Title2}>
          You are invited to join {organization.name}
        </Typography>

        <div className="flex items-center gap-4">
          <ProfileImageLink user={member} className="shrink-0" />
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="max-w-full shrink"
          >
            <Link href={member.permalink} passHref>
              <a>
                <span className="font-bold text-text-primary">
                  {member.name}
                </span>{' '}
                (@{member.username})
              </a>
            </Link>{' '}
            has invited you to join their organization
          </Typography>
        </div>

        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Organizations let your team unlock the full power of daily.dev Plus
          together including premium features, shared learning, and streamlined
          user management, all in one place.
        </Typography>

        <div className="flex flex-col gap-4 rounded-16 border border-brand-default p-4">
          <div className="flex items-center gap-4">
            <Image
              className="size-12 rounded-full object-cover"
              src={organization.image}
              alt={`Avatar of ${organization.name}`}
              type={ImageType.Organization}
            />

            <div className="flex flex-1 flex-col">
              <Typography
                bold
                type={TypographyType.Title3}
                color={TypographyColor.Primary}
              >
                {organization.name}
              </Typography>
              <Typography
                type={TypographyType.Body}
                color={TypographyColor.Tertiary}
              >
                {seats.available} seats available
              </Typography>
            </div>

            <Button
              variant={ButtonVariant.Primary}
              disabled={seats.available <= 0}
              className="ml-auto"
              onClick={onJoinClick}
              loading={isJoiningOrganization}
            >
              Join
            </Button>
          </div>

          {seats.available <= 0 && (
            <div className="flex items-center gap-2">
              <InfoIcon
                size={IconSize.XSmall}
                className="relative top-[1px] !fill-status-help text-status-help"
              />
              <Typography type={TypographyType.Callout}>
                No seats left. Ask your admin to add more seats to the
                organization.
              </Typography>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

interface QueryParams {
  token: string;
  orgId: string;
}

export const getServerSideProps: GetServerSideProps<{
  token: string;
  organization: Omit<Organization, 'members'>;
  user: Author;
}> = async ({ query, res }) => {
  const params = query as unknown as QueryParams;
  const { token, orgId } = params;

  if (!token || !orgId) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    const { getOrganizationByIdAndInviteToken } = await gqlClient.request<{
      getOrganizationByIdAndInviteToken: {
        user: Author;
        organization: Omit<Organization, 'members'>;
      };
    }>(GET_ORGANIZATION_BY_ID_AND_INVITE_TOKEN_QUERY, {
      id: orgId,
      token,
    });

    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${24 * 60 * 60}`,
    );

    return {
      props: {
        token,
        user: getOrganizationByIdAndInviteToken?.user,
        organization: getOrganizationByIdAndInviteToken?.organization,
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};

export default Page;

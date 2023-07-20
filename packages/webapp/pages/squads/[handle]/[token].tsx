import { PageContainer } from '@dailydotdev/shared/src/components/utilities';
import { useQuery, useMutation } from 'react-query';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  getSquadInvitation,
  validateSourceHandle,
} from '@dailydotdev/shared/src/graphql/squads';
import {
  SourceMember,
  SourceMemberRole,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  ApiErrorMessage,
  ApiErrorResult,
  Edge,
} from '@dailydotdev/shared/src/graphql/common';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Link from 'next/link';
import SourceButton from '@dailydotdev/shared/src/components/cards/SourceButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { ParsedUrlQuery } from 'querystring';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { NextSeo } from 'next-seo';
import { disabledRefetch } from '@dailydotdev/shared/src/lib/func';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { AnalyticsEvent, Origin } from '@dailydotdev/shared/src/lib/analytics';
import { NextSeoProps } from 'next-seo/lib/types';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ReferralOriginKey } from '@dailydotdev/shared/src/lib/user';
import { useJoinSquad } from '@dailydotdev/shared/src/hooks';
import { labels } from '@dailydotdev/shared/src/lib';
import { SimpleSquadJoinButton } from '@dailydotdev/shared/src/components/squads/SquadJoinButton';
import useMedia from '@dailydotdev/shared/src/hooks/useMedia';
import { tablet } from '@dailydotdev/shared/src/styles/media';
import { getLayout } from '../../../components/layouts/MainLayout';

const getOthers = (others: Edge<SourceMember>[], total: number) => {
  const { length } = others;
  if (length === 0) {
    return 'is';
  }

  if (length === 1) {
    const member = others[0].node.user.name;
    return `and ${member} are`;
  }

  return `and ${total - 1} others are`;
};

const BodyParagraph = classed('p', 'typo-body text-theme-label-tertiary');
const HighlightedText = classed('span', 'font-bold text-theme-label-primary');

export interface SquadReferralProps {
  token: string;
  handle: string;
  initialData: SourceMember;
}

const SquadReferral = ({
  token,
  handle,
  initialData,
}: SquadReferralProps): ReactElement => {
  const router = useRouter();
  const isMobile = !useMedia([tablet.replace('@media ', '')], [true], false);
  const { isFallback } = router;
  const { trackEvent } = useContext(AnalyticsContext);
  const { displayToast } = useToastNotification();
  const { showLogin, user: loggedUser } = useAuthContext();
  const [trackedImpression, setTrackedImpression] = useState(false);
  const { data: member, isFetched } = useQuery(
    ['squad_referral', token, loggedUser?.id],
    () => getSquadInvitation(token),
    {
      ...disabledRefetch,
      keepPreviousData: true,
      initialData,
      retry: false,
      enabled: !!token,
      onSuccess: (response) => {
        if (!loggedUser) return null;
        if (!response?.source?.id) return router.replace(webappUrl);

        const squadsUrl = `/squads/${handle}`;
        const isValid = validateSourceHandle(handle, response.source);

        if (!isValid) return router.replace(webappUrl);

        const { currentMember } = response.source;
        if (currentMember) {
          const { role } = currentMember;
          if (role !== SourceMemberRole.Blocked) {
            return router.replace(squadsUrl);
          }
        }

        return null;
      },
    },
  );

  const joinSquadAnalyticsExtra = () => {
    return JSON.stringify({
      inviter: member.user.id,
      squad: member.source.id,
    });
  };

  useEffect(() => {
    if (trackedImpression || !member) return;

    trackEvent({
      event_name: AnalyticsEvent.ViewSquadInvitation,
      extra: joinSquadAnalyticsExtra(),
    });

    setTrackedImpression(true);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member, trackedImpression]);

  const { mutateAsync: onJoinSquad } = useMutation(
    useJoinSquad({
      squad: { handle, id: member?.source?.id },
      referralToken: token,
    }),
    {
      onSuccess: (data) => {
        router.replace(data.permalink);
      },
      onError: (error: ApiErrorResult) => {
        const errorMessage = error?.response?.errors?.[0]?.message;

        if (errorMessage === ApiErrorMessage.SourcePermissionInviteInvalid) {
          displayToast(labels.squads.invalidInvitation);
        } else {
          displayToast(labels.error.generic);
        }
      },
    },
  );

  const onJoinClick = async () => {
    if (member.source?.currentMember?.role === SourceMemberRole.Blocked) {
      displayToast(labels.squads.forbidden);
      return null;
    }

    if (loggedUser) return onJoinSquad();

    return showLogin('join squad', {
      referral: member.user.id,
      referralOrigin: ReferralOriginKey.Squad,
      onLoginSuccess: onJoinSquad,
      onRegistrationSuccess: onJoinSquad,
    });
  };

  if (!member) {
    return null;
  }

  const { user, source } = member;
  const others = source.members.edges.filter(
    ({ node }) => node.user.id !== user.id,
  );
  const othersLabel = getOthers(
    source.members.edges.filter(({ node }) => node.user.id !== user.id),
    source.membersCount,
  );

  const seo: NextSeoProps = {
    title: `${user.name} invited you to ${source.name}`,
    description: source.description,
    openGraph: {
      images: [{ url: source?.image }],
    },
  };

  if (!initialData && (isFallback || !isFetched)) {
    return <></>;
  }

  return (
    <PageContainer className="relative items-center pt-10 tablet:pt-20">
      <NextSeo {...seo} />
      <div className="absolute -top-4 right-0 tablet:-right-20 left-0 tablet:-left-20 h-40 rounded-26 max-w-[100vw] squad-background-fade" />
      <h1 className="typo-title1">You are invited to join {source.name}</h1>
      <BodyParagraph className="mt-6">
        {source.name} is your place to stay up to date as a squad. You and your
        squad members can share knowledge and content in one place. Join now to
        start collaborating.
      </BodyParagraph>
      <span className="flex flex-row items-center mt-8" data-testid="inviter">
        <ProfileImageLink user={user} />
        <BodyParagraph className="flex-1 ml-4">
          <HighlightedText>{user.name}</HighlightedText>{' '}
          <Link href={user.permalink}>
            <a href={user.permalink}>(@{user.username})</a>
          </Link>{' '}
          has invited you to <HighlightedText>{source.name}</HighlightedText>
        </BodyParagraph>
      </span>
      <div className="flex flex-col p-6 my-8 w-full rounded-24 border border-theme-color-cabbage">
        <span className="flex flex-col tablet:flex-row items-start tablet:items-center">
          <div className="flex flex-row items-start">
            <SourceButton source={source} size="xxlarge" />
            <div className="flex flex-col ml-4">
              <h2 className="flex flex-col typo-headline">{source.name}</h2>
              <BodyParagraph className="mt-2">@{source.handle}</BodyParagraph>
              {source.description && (
                <BodyParagraph className="mt-4 break-words">
                  {source.description}
                </BodyParagraph>
              )}
            </div>
          </div>
          <SimpleSquadJoinButton
            className={classNames(
              'btn-primary',
              isMobile ? 'flex mt-4 w-full' : 'ml-auto',
            )}
            buttonSize={ButtonSize.Large}
            onClick={onJoinClick}
            squad={source}
            origin={Origin.SquadInvitation}
          >
            Join squad
          </SimpleSquadJoinButton>
        </span>
      </div>
      <BodyParagraph data-testid="waiting-users">
        {user.name} {othersLabel} waiting for you inside. Join them now!
      </BodyParagraph>
      <span className="flex flex-row flex-wrap gap-2 mt-6">
        {others.slice(0, 10).map(({ node }) => (
          <ProfileImageLink key={node.user.id} user={node.user} />
        ))}
      </span>
    </PageContainer>
  );
};

SquadReferral.getLayout = getLayout;
SquadReferral.layoutProps = { showSidebar: false };

export default SquadReferral;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<SquadReferralProps & ParsedUrlQuery>): Promise<
  GetStaticPropsResult<SquadReferralProps>
> {
  const { handle, token } = params;
  const initialData = await getSquadInvitation(token);
  return {
    props: {
      handle,
      token,
      initialData,
    },
    revalidate: 60,
  };
}

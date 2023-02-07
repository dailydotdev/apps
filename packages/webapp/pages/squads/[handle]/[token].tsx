import { PageContainer } from '@dailydotdev/shared/src/components/utilities';
import { useQuery, useMutation } from 'react-query';
import { useRouter } from 'next/router';
import {
  getSquadInvitation,
  joinSquadInvitation,
  SquadMember,
  validateSourceHandle,
} from '@dailydotdev/shared/src/graphql/squads';
import { Edge } from '@dailydotdev/shared/src/graphql/common';
import { ProfileImageLink } from '@dailydotdev/shared/src/components/profile/ProfileImageLink';
import classed from '@dailydotdev/shared/src/lib/classed';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Link from 'next/link';
import SourceButton from '@dailydotdev/shared/src/components/cards/SourceButton';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useBoot } from '@dailydotdev/shared/src/hooks/useBoot';
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
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import { getLayout } from '../../../components/layouts/MainLayout';

const getOthers = (others: Edge<SquadMember>[]) => {
  const { length } = others;
  if (length === 0) {
    return 'is';
  }

  if (length === 1) {
    const member = others[0].node.user.name;
    return `and ${member} are`;
  }

  return `and ${length} others are`;
};

const BodyParagraph = classed('p', 'typo-body text-theme-label-tertiary');
const HighlightedText = classed('span', 'font-bold text-theme-label-primary');

export interface SquadReferralProps {
  token: string;
  handle: string;
}

const SquadReferral = ({ token, handle }: SquadReferralProps): ReactElement => {
  const router = useRouter();
  const { trackEvent } = useContext(AnalyticsContext);
  const { addSquad } = useBoot();
  const { showLogin, user: loggedUser, squads } = useAuthContext();
  const [trackedImpression, setTrackedImpression] = useState(false);

  const { data: member } = useQuery(
    ['squad_referral', token, loggedUser?.id],
    () => getSquadInvitation(token),
    {
      ...disabledRefetch,
      keepPreviousData: true,
      retry: false,
      enabled: !!token,
      onSuccess: (response) => {
        if (!loggedUser) return null;
        if (!response?.source?.id) return router.replace(webappUrl);

        const squadsUrl = `/squads/${handle}`;
        const isValid = validateSourceHandle(handle, response.source);

        if (!isValid) return router.replace(webappUrl);

        const isMember = response.source.members.edges.some(
          ({ node }) => node.user.id === loggedUser.id,
        );
        if (isMember) return router.replace(squadsUrl);

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
  }, [member, trackedImpression]);

  const sourceId = member?.source?.id;
  const { mutateAsync: onJoinSquad } = useMutation(
    () => joinSquadInvitation({ sourceId, token }),
    {
      onSuccess: (data) => {
        trackEvent({
          event_name: AnalyticsEvent.CompleteJoiningSquad,
          extra: joinSquadAnalyticsExtra(),
        });

        const squad = squads.find(({ id }) => id === data.id);
        if (squad) return router.replace(squad.permalink);

        addSquad(data);
        return router.replace(data.permalink);
      },
    },
  );

  const onJoinClick = async () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickJoinSquad,
      extra: joinSquadAnalyticsExtra(),
    });

    if (loggedUser) return onJoinSquad();

    return showLogin('join squad', {
      referral: member.user.id,
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
  );

  return (
    <PageContainer className="relative justify-center items-center pt-24">
      <NextSeo
        title={`Invitation to ${source.name}`}
        titleTemplate="%s | daily.dev"
      />
      <div className="absolute -top-4 -right-20 -left-20 h-40 rounded-26 squad-background-fade" />
      <h1 className="typo-title1">You are invited to join {source.name}</h1>
      <BodyParagraph className="mt-6">
        {source.name} is your place to stay up to date as a squad. You and your
        squad members can share knowledge and content in one place. Join now to
        start collaborating.
      </BodyParagraph>
      <span className="flex flex-row items-center mt-10" data-testid="inviter">
        <ProfileImageLink user={user} />
        <BodyParagraph className="flex-1 ml-4">
          <HighlightedText>{user.name}</HighlightedText>{' '}
          <Link href={user.permalink}>
            <a href={user.permalink}>(@{user.username})</a>
          </Link>{' '}
          has invited you to <HighlightedText>{source.name}</HighlightedText>
        </BodyParagraph>
      </span>
      <div className="flex flex-col p-6 my-10 w-full rounded-24 border border-theme-color-cabbage">
        <span className="flex flex-row items-center">
          <SourceButton source={source} size="xxlarge" />
          <div className="flex flex-col ml-4">
            <h2 className="flex flex-col typo-headline">{source.name}</h2>
            <BodyParagraph className="mt-2">@{source.handle}</BodyParagraph>
          </div>
          <Button
            className="ml-auto btn-primary"
            buttonSize="large"
            onClick={onJoinClick}
          >
            Join Squad
          </Button>
        </span>
        <BodyParagraph className="mt-3 ml-[4.5rem]">
          {source.description}
        </BodyParagraph>
      </div>
      <BodyParagraph data-testid="waiting-users">
        {user.name} {othersLabel} waiting for you inside. Join them now!
      </BodyParagraph>
      <span className="flex flex-row gap-2 mt-6">
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

export function getStaticProps({
  params,
}: GetStaticPropsContext<
  SquadReferralProps & ParsedUrlQuery
>): GetStaticPropsResult<SquadReferralProps> {
  return { props: { ...params } };
}

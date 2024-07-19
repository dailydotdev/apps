import { PageContainer } from '@dailydotdev/shared/src/components/utilities';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
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
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';
import { NextSeoProps } from 'next-seo/lib/types';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ReferralOriginKey } from '@dailydotdev/shared/src/lib/user';
import { useJoinSquad } from '@dailydotdev/shared/src/hooks';
import { labels } from '@dailydotdev/shared/src/lib';
import { SimpleSquadJoinButton } from '@dailydotdev/shared/src/components/squads/SquadJoinButton';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { getLayout } from '../../../components/layouts/MainLayout';
import { getSquadOpenGraph } from '../../../next-seo';

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

const BodyParagraph = classed('p', 'typo-body text-text-tertiary');
const HighlightedText = classed('span', 'font-bold text-text-primary');

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
  const { isFallback } = router;
  const { logEvent } = useContext(LogContext);
  const { displayToast } = useToastNotification();
  const { showLogin, user: loggedUser } = useAuthContext();
  const [loggedImpression, setLoggedImpression] = useState(false);
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
        if (!loggedUser) {
          return null;
        }

        if (!response?.source?.id) {
          return router.replace(webappUrl);
        }

        const squadsUrl = `/squads/${handle}`;
        const isValid = validateSourceHandle(handle, response.source);

        if (!isValid) {
          return router.replace(webappUrl);
        }

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

  const joinSquadLogExtra = () => {
    return JSON.stringify({
      inviter: member.user.id,
      squad: member.source.id,
    });
  };

  useEffect(() => {
    if (loggedImpression || !member) {
      return;
    }

    logEvent({
      event_name: LogEvent.ViewSquadInvitation,
      extra: joinSquadLogExtra(),
    });

    setLoggedImpression(true);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member, loggedImpression]);

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

    if (loggedUser) {
      return onJoinSquad();
    }

    return showLogin({
      trigger: AuthTriggers.JoinSquad,
      options: {
        referral: member.user.id,
        referralOrigin: ReferralOriginKey.Squad,
        onLoginSuccess: () => onJoinSquad(),
        onRegistrationSuccess: () => onJoinSquad(),
      },
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
    openGraph: getSquadOpenGraph({ squad: source }),
  };

  if (!initialData && (isFallback || !isFetched)) {
    return <></>;
  }

  return (
    <PageContainer className="relative items-center pt-10 tablet:pt-20">
      <NextSeo {...seo} />
      <div className="squad-background-fade absolute -top-4 left-0 right-0 h-40 max-w-[100vw] rounded-26 tablet:-left-20 tablet:-right-20" />
      <h1 className="typo-title1">You are invited to join {source.name}</h1>
      <BodyParagraph className="mt-6">
        {source.name} is your place to stay up to date as a Squad. You and your
        Squad members can share knowledge and content in one place. Join now to
        start collaborating.
      </BodyParagraph>
      <span className="mt-8 flex flex-row items-center" data-testid="inviter">
        <ProfileImageLink user={user} />
        <BodyParagraph className="ml-4 flex-1">
          <HighlightedText>{user.name}</HighlightedText>{' '}
          <Link href={user.permalink}>
            <a href={user.permalink}>(@{user.username})</a>
          </Link>{' '}
          has invited you to <HighlightedText>{source.name}</HighlightedText>
        </BodyParagraph>
      </span>
      <div className="my-8 flex w-full flex-col rounded-24 border border-accent-cabbage-default p-6">
        <span className="flex flex-col items-start tablet:flex-row tablet:items-center">
          <div className="flex flex-1 flex-row items-start">
            <SourceButton source={source} size={ProfileImageSize.XXLarge} />
            <div className="ml-4 mr-0 flex flex-1 flex-col tablet:mr-4">
              <h2 className="flex flex-col font-bold typo-body">
                {source.name}
              </h2>
              <BodyParagraph className="mt-2">@{source.handle}</BodyParagraph>
              {source.description && (
                <BodyParagraph className="mt-4 break-words">
                  {source.description}
                </BodyParagraph>
              )}
            </div>
          </div>
          <SimpleSquadJoinButton
            className="mt-4 w-full tablet:ml-auto tablet:mt-0 tablet:w-auto"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            onClick={onJoinClick}
            squad={source}
            origin={Origin.SquadInvitation}
            inviterMember={member?.user}
          >
            Join Squad
          </SimpleSquadJoinButton>
        </span>
      </div>
      <BodyParagraph data-testid="waiting-users">
        {user.name} {othersLabel} waiting for you inside. Join them now!
      </BodyParagraph>
      <span className="mt-6 flex flex-row flex-wrap gap-2">
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

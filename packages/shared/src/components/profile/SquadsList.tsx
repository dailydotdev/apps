import React, { ReactElement, useContext, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import request from 'graphql-request';
import { SourceMember, SourceMemberRole } from '../../graphql/sources';
import { largeNumberFormat } from '../../lib/numberFormat';
import { Image } from '../image/Image';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import { CardLink } from '../cards/Card';
import PlusIcon from '../icons/Plus';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/ButtonV2';
import {
  useJoinSquad,
  useToastNotification,
  useViewSize,
  ViewSize,
} from '../../hooks';
import { labels } from '../../lib';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { graphqlUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import {
  ProfileV2,
  PUBLIC_SOURCE_MEMBERSHIPS_QUERY,
} from '../../graphql/users';
import { Connection } from '../../graphql/common';
import { AuthTriggers } from '../../lib/auth';
import { webappUrl } from '../../lib/constants';

export interface SquadsListProps {
  memberships?: Connection<SourceMember>;
  userId: string;
}

function SquadItem({
  membership,
  loading,
}: {
  membership: SourceMember;
  loading?: boolean;
}): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const router = useRouter();
  const squad = membership.source;
  const showJoin = !squad.currentMember?.role && !loading;
  const { displayToast } = useToastNotification();

  const { mutateAsync: joinSquad, isLoading } = useMutation(
    useJoinSquad({ squad }),
    {
      onError: () => {
        displayToast(labels.error.generic);
      },
      onSuccess: () => router.push(squad?.permalink),
    },
  );

  const onJoin = async () => {
    if (!user) {
      showLogin({
        trigger: AuthTriggers.JoinSquad,
        options: {
          onLoginSuccess: joinSquad,
          onRegistrationSuccess: joinSquad,
        },
      });

      return;
    }

    await joinSquad();
  };

  return (
    <div
      className="flex relative items-center p-2 w-40 tablet:w-auto bg-theme-float rounded-2xl"
      data-testid={squad.id}
    >
      <Link href={squad.permalink} prefetch={false} passHref>
        <CardLink />
      </Link>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Image
            src={squad.image}
            alt={squad.name}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex overflow-hidden flex-col flex-1">
            <div className="overflow-hidden font-bold whitespace-nowrap typo-caption1 text-ellipsis">
              {squad.name}
            </div>
            <div className="overflow-hidden whitespace-nowrap text-theme-label-quaternary typo-caption2 text-ellipsis">
              @{squad.handle}
            </div>
          </div>
        </div>
        <div className="flex items-center mt-1 h-6 tablet:h-auto text-theme-label-tertiary typo-caption2">
          {membership.role === SourceMemberRole.Admin && (
            <>
              <SquadMemberBadge
                role={membership.role}
                removeMargins
                disableResponsive
              />
              <span className="mx-0.5">&#x2022;</span>
            </>
          )}
          <span className="overflow-hidden flex-1 whitespace-nowrap text-ellipsis">
            {largeNumberFormat(squad.membersCount)} members
          </span>
          {showJoin && (
            <Button
              className="tablet:hidden z-1 ml-auto"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.XSmall}
              icon={<PlusIcon />}
              onClick={onJoin}
              loading={isLoading}
              aria-label="Join Squad"
            />
          )}
        </div>
      </div>
      {showJoin && (
        <Button
          className="hidden tablet:flex z-1"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={onJoin}
          loading={isLoading}
        >
          Join
        </Button>
      )}
    </div>
  );
}

export function SquadsList({
  memberships: initialMembership,
  userId,
}: SquadsListProps): ReactElement {
  const isWide = useViewSize(ViewSize.Tablet);
  const { user: loggedUser, tokenRefreshed } = useContext(AuthContext);
  const { data: remoteMemberships } = useQuery<{
    sources: ProfileV2['sources'];
  }>(
    generateQueryKey(RequestKey.PublicSourceMemberships, loggedUser, userId),
    () => request(graphqlUrl, PUBLIC_SOURCE_MEMBERSHIPS_QUERY, { id: userId }),
    {
      enabled: !!tokenRefreshed,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  );
  const [showMore, setShowMore] = useState(false);
  const memberships = remoteMemberships?.sources || initialMembership;
  const loading = !remoteMemberships;

  let edges = memberships?.edges || [];
  if (isWide && !showMore) {
    edges = edges.slice(0, 3);
  }

  if (!edges.length) {
    return (
      <div className="flex overflow-hidden gap-2">
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Large}
          tag="a"
          href={`${webappUrl}squads/new?origin=profile`}
          icon={<PlusIcon />}
          aria-label="Create a new Squad"
        />
        <div className="rounded-2xl border flex-[3] border-theme-divider-tertiary" />
        <div className="rounded-l-2xl border flex-[2] border-theme-divider-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto tablet:flex-col gap-2 items-center tablet:items-stretch no-scrollbar">
      {edges.map(({ node }) => (
        <SquadItem key={node.source.id} membership={node} loading={loading} />
      ))}
      {isWide && !showMore && edges.length < memberships.edges.length && (
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => setShowMore(true)}
        >
          Show more Squads
        </Button>
      )}
    </div>
  );
}

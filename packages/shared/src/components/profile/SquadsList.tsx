import React, { ReactElement, useContext, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { SourceMember, SourceMemberRole } from '../../graphql/sources';
import { largeNumberFormat } from '../../lib/numberFormat';
import { Image } from '../image/Image';
import SquadMemberBadge from '../squads/SquadMemberBadge';
import { CardLink } from '../cards/Card';
import { PlusIcon } from '../icons';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import {
  useJoinSquad,
  useToastNotification,
  useViewSize,
  ViewSize,
} from '../../hooks';
import { labels } from '../../lib';
import { generateQueryKey, RequestKey } from '../../lib/query';
import AuthContext from '../../contexts/AuthContext';
import {
  ProfileV2,
  PUBLIC_SOURCE_MEMBERSHIPS_QUERY,
} from '../../graphql/users';
import { Connection, gqlClient } from '../../graphql/common';
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
          onLoginSuccess: () => joinSquad(),
          onRegistrationSuccess: () => joinSquad(),
        },
      });

      return;
    }

    await joinSquad();
  };

  return (
    <div
      className="relative flex w-40 items-center rounded-16 bg-surface-float p-2 first:ml-4 hover:bg-surface-hover tablet:w-auto tablet:first:ml-0"
      data-testid={squad.id}
    >
      <Link href={squad.permalink} prefetch={false} passHref>
        <CardLink />
      </Link>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2">
          <Image
            src={squad.image}
            alt={squad.name}
            className="h-8 w-8 rounded-full"
          />
          <div className="flex flex-1 flex-col">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold typo-caption1">
              {squad.name}
            </p>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-text-quaternary typo-caption2">
              @{squad.handle}
            </p>
          </div>
        </div>
        <div className="mt-1 flex h-6 items-center text-text-tertiary typo-caption2 tablet:h-auto">
          {membership.role !== SourceMemberRole.Member && (
            <>
              <SquadMemberBadge
                role={membership.role}
                removeMargins
                disableResponsive
              />
              <span className="mx-0.5">&#x2022;</span>
            </>
          )}
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {largeNumberFormat(squad.membersCount)} members
          </span>
          {showJoin && (
            <Button
              className="z-1 ml-auto tablet:hidden"
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
          className="z-1 hidden tablet:flex"
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

const MAX_SQUADS = 3;

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
    () => gqlClient.request(PUBLIC_SOURCE_MEMBERSHIPS_QUERY, { id: userId }),
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
    edges = edges.slice(0, MAX_SQUADS);
  }

  if (!edges.length) {
    return (
      <div className="flex gap-2 overflow-hidden pl-4">
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Large}
          tag="a"
          href={`${webappUrl}squads/new?origin=profile`}
          icon={<PlusIcon />}
          aria-label="Create a new Squad"
        />
        <div className="flex-[3] rounded-16 border border-border-subtlest-tertiary" />
        <div className="flex-[2] rounded-l-16 border border-border-subtlest-tertiary" />
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto laptop:flex-col laptop:items-stretch laptop:px-4">
      {edges.map(({ node }) => (
        <SquadItem key={node.source.id} membership={node} loading={loading} />
      ))}
      {isWide && memberships.edges.length > MAX_SQUADS && (
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? 'Show less' : 'Show more Squads'}
        </Button>
      )}
    </div>
  );
}

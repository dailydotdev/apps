import type { ReactElement } from 'react';
import React, { useContext, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import type { SourceMember } from '../../graphql/sources';
import { SourceMemberRole } from '../../graphql/sources';
import { largeNumberFormat } from '../../lib/numberFormat';
import { Image } from '../image/Image';
import { CardLink } from '../cards/common/Card';
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
import type { ProfileV2 } from '../../graphql/users';
import { PUBLIC_SOURCE_MEMBERSHIPS_QUERY } from '../../graphql/users';
import type { Connection } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import { AuthTriggers } from '../../lib/auth';
import { webappUrl } from '../../lib/constants';
import { getRoleName } from '../utilities';
import UserBadge from '../UserBadge';

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

  const { mutateAsync: joinSquad, isPending: isLoading } = useMutation({
    mutationFn: useJoinSquad({ squad }),
    onError: () => {
      displayToast(labels.error.generic);
    },
    onSuccess: () => {
      router.push(squad?.permalink);
    },
  });

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
      className="rounded-16 bg-surface-float hover:bg-surface-hover tablet:w-auto tablet:first:ml-0 relative flex w-40 items-center p-2 first:ml-4"
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
            <p className="typo-caption1 overflow-hidden text-ellipsis whitespace-nowrap font-bold">
              {squad.name}
            </p>
            <p className="text-text-quaternary typo-caption2 overflow-hidden text-ellipsis whitespace-nowrap">
              @{squad.handle}
            </p>
          </div>
        </div>
        <div className="text-text-tertiary typo-caption2 tablet:h-auto mt-1 flex h-6 items-center">
          {membership.role !== SourceMemberRole.Member && (
            <>
              <UserBadge role={membership.role}>
                {getRoleName(membership.role)}
              </UserBadge>
              <span className="mx-0.5">&#x2022;</span>
            </>
          )}
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {largeNumberFormat(squad.membersCount)} members
          </span>
          {showJoin && (
            <Button
              className="z-1 tablet:hidden ml-auto"
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
          className="z-1 tablet:flex hidden"
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
  }>({
    queryKey: generateQueryKey(
      RequestKey.PublicSourceMemberships,
      loggedUser,
      userId,
    ),
    queryFn: () =>
      gqlClient.request(PUBLIC_SOURCE_MEMBERSHIPS_QUERY, { id: userId }),
    enabled: !!tokenRefreshed,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
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
        <div className="rounded-16 border-border-subtlest-tertiary flex-[3] border" />
        <div className="rounded-l-16 border-border-subtlest-tertiary flex-[2] border" />
      </div>
    );
  }

  return (
    <div className="no-scrollbar laptop:flex-col laptop:items-stretch laptop:px-4 flex items-center gap-2 overflow-x-auto">
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

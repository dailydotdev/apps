import type { MouseEvent, ReactElement } from 'react';
import React, { useMemo, useRef } from 'react';
import classNames from 'classnames';
import type { InfiniteData } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SourceMember, Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import type { SourcesQueryData } from '../../../../hooks/source/useSources';
import {
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  SimpleSquadJoinButton,
  updateSquadMembershipInListData,
} from '../../../../components/squads/SquadActionButton';
import { SimpleTooltip } from '../../../../components/tooltips/SimpleTooltip';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useToastNotification } from '../../../../hooks/useToastNotification';
import { useJoinSquad } from '../../../../hooks/useJoinSquad';
import { useLeaveSquad } from '../../../../hooks/useLeaveSquad';
import { AuthTriggers } from '../../../../lib/auth';
import { labels } from '../../../../lib/labels';
import { Origin } from '../../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { getSquadId } from '../../lib/features';
import type { SquadDiscoverSection } from './common';

interface SquadJoinButtonProps {
  squad: Squad;
  section: SquadDiscoverSection;
  size?: ButtonSize;
  className?: string;
}

const blockedTooltip = 'You are not allowed to join the Squad';

// Join is instant and reversible: the squad flips to joined before the
// request returns and the toast offers Undo. A joined squad shows no button,
// leaving belongs to the squad's own page.
export const SquadJoinButton = ({
  squad,
  section,
  size = ButtonSize.Small,
  className,
}: SquadJoinButtonProps): ReactElement | null => {
  const queryClient = useQueryClient();
  const { user, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const logExtra = useMemo(() => ({ section }), [section]);
  const joinSquad = useJoinSquad({
    squad,
    origin: Origin.SquadDirectory,
    logExtra,
  });
  const leaveSquad = useLeaveSquad({ squad });
  const isBlocked = squad.currentMember?.role === SourceMemberRole.Blocked;

  const pendingJoin = useRef<Promise<Squad>>();

  const setMembership = (member: SourceMember | undefined) => {
    const update = (current: Squad): Squad => {
      if (!!current.currentMember === !!member) {
        return current;
      }

      return {
        ...current,
        currentMember: member && { ...member, source: current },
        membersCount: current.membersCount + (member ? 1 : -1),
      };
    };

    queryClient.setQueriesData<InfiniteData<SourcesQueryData<Squad>>>(
      { queryKey: [RequestKey.Sources] },
      (data) =>
        data?.pages
          ? updateSquadMembershipInListData(data, getSquadId(squad), update)
          : data,
    );
    queryClient.setQueryData<Squad>(
      generateQueryKey(RequestKey.Squad, user, squad.handle),
      (current) => current && update(current),
    );
  };

  const { mutate: undo } = useMutation({
    mutationFn: async () => {
      // Leaving before the join lands would let the join win.
      await pendingJoin.current?.catch(() => undefined);

      // Told apart from leaves on the squad page in the leave-rate guardrail.
      return leaveSquad({ forceLeave: true, logExtra: { undo: true } });
    },
    onMutate: () => setMembership(undefined),
    // The join's own cache writes may land after the optimistic leave.
    onSuccess: () => setMembership(undefined),
    onError: async () => {
      const joined = await pendingJoin.current?.catch(() => undefined);
      setMembership(joined?.currentMember);
      displayToast(labels.error.generic);
    },
  });

  const { mutate: join, isPending } = useMutation({
    mutationFn: () => {
      pendingJoin.current = joinSquad();

      return pendingJoin.current;
    },
    onMutate: () => {
      // Right after a sign up the user may not have reached this render, so
      // the response below fills the membership in.
      setMembership(
        user
          ? {
              role: SourceMemberRole.Member,
              referralToken: '',
              user: { ...user, reputation: user.reputation ?? 0 },
              source: squad,
            }
          : undefined,
      );
      displayToast(`Joined ${squad.name}`, {
        action: { copy: 'Undo', onClick: () => undo() },
      });
    },
    onSuccess: (result) => setMembership(result.currentMember),
    onError: () => {
      setMembership(undefined);
      displayToast(labels.error.generic);
    },
  });

  if (squad.currentMember && !isBlocked) {
    return null;
  }

  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      showLogin({
        trigger: AuthTriggers.JoinSquad,
        options: {
          onLoginSuccess: () => join(),
          onRegistrationSuccess: () => join(),
        },
      });
      return;
    }

    join();
  };

  return (
    <SimpleTooltip
      placement="bottom"
      disabled={!isBlocked}
      content={blockedTooltip}
    >
      <span className={classNames('relative z-1 shrink-0', className)}>
        <SimpleSquadJoinButton
          type="button"
          size={size}
          variant={ButtonVariant.Primary}
          squad={squad}
          origin={Origin.SquadDirectory}
          aria-label={isBlocked ? blockedTooltip : `Join ${squad.name}`}
          disabled={isBlocked || isPending}
          onClick={onClick}
        >
          Join
        </SimpleSquadJoinButton>
      </span>
    </SimpleTooltip>
  );
};

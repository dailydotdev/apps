import type { MouseEvent, ReactElement, Ref } from 'react';
import React, { forwardRef, useCallback } from 'react';
import classNames from 'classnames';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostCardProps } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import { anchorDefaultRel } from '../../../lib/strings';
import type { TopActiveSquad } from '../../../hooks/useTopActiveSquads';
import type { SourceTooltip, Squad } from '../../../graphql/sources';
import { SourceType } from '../../../graphql/sources';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useJoinSquad, useToastNotification } from '../../../hooks';
import { labels } from '../../../lib';
import { AuthTriggers } from '../../../lib/auth';
import type { SquadStaticData } from '../../../graphql/squads';
import { RequestKey } from '../../../lib/query';

const SKELETON_KEYS = Array.from(
  { length: 8 },
  (_, index) => `skeleton-${index}`,
);

const TOP_ACTIVE_SQUAD_PLACEHOLDER_ID_PREFIX = 'top-active-squad-';

interface TopSquadsGridCardProps extends PostCardProps {
  squads?: TopActiveSquad[];
  isPending?: boolean;
}

const formatMembersCount = (count?: number): string | null => {
  if (typeof count !== 'number' || count <= 0) {
    return null;
  }

  if (count >= 1000) {
    const formatted = (count / 1000).toFixed(1).replace(/\.0$/, '');

    return `${formatted}k members`;
  }

  return `${count} members`;
};

const isPlaceholderTopActiveSquadId = (id: string): boolean =>
  id.startsWith(TOP_ACTIVE_SQUAD_PLACEHOLDER_ID_PREFIX);

const toSourceTooltip = (squad: TopActiveSquad): SourceTooltip => ({
  id: squad.id,
  name: squad.name,
  image: squad.image,
  handle: squad.handle,
  permalink: squad.permalink,
  type: SourceType.Squad,
  membersCount: squad.membersCount,
});

const SquadRowJoinButton = ({
  squad,
}: {
  squad: TopActiveSquad;
}): ReactElement | null => {
  const queryClient = useQueryClient();
  const { user, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();

  const squadForJoin: Pick<Squad, 'id' | 'handle' | 'privilegedMembers'> = {
    id: squad.id,
    handle: squad.handle,
  };

  const { mutateAsync: joinSquad, isPending: isJoining } = useMutation({
    mutationFn: useJoinSquad({ squad: squadForJoin }),
    onError: () => {
      displayToast(labels.error.generic);
    },
    onSuccess: (joined) => {
      displayToast(`🙌 You joined the Squad ${joined.name}`);
      queryClient.setQueryData<SquadStaticData | undefined>(
        [RequestKey.Squad, 'top-active', squad.handle],
        (prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            currentMember: joined.currentMember,
            membersCount: joined.membersCount,
          };
        },
      );
    },
  });

  const onJoinClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

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
    },
    [joinSquad, showLogin, user],
  );

  return (
    <Button
      type="button"
      variant={ButtonVariant.Float}
      size={ButtonSize.XSmall}
      className="shrink-0 px-2 shadow-2"
      aria-label={`Join ${squad.name}`}
      loading={isJoining}
      onClick={onJoinClick}
    >
      Join
    </Button>
  );
};

const SquadRow = ({
  squad,
  rank,
}: {
  squad: TopActiveSquad;
  rank: number;
}): ReactElement => {
  const membersLabel = formatMembersCount(squad.membersCount);
  const showJoinButton =
    !isPlaceholderTopActiveSquadId(squad.id) && !squad.currentMember;

  return (
    <div className="group relative flex min-w-0 items-center gap-1 rounded-12 py-2 pl-2 pr-1 transition-colors hover:bg-surface-hover">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
        <span className="w-6 shrink-0 text-center font-bold text-text-tertiary typo-callout">
          #{rank}
        </span>
        <SourceButton
          source={toSourceTooltip(squad)}
          size={ProfileImageSize.Large}
          className="shrink-0"
        />
        <a
          href={squad.permalink}
          rel={anchorDefaultRel}
          aria-label={squad.name}
          className="focus-visible-outline flex min-w-0 flex-1 flex-col rounded-10"
        >
          <span className="truncate font-bold text-text-primary typo-callout">
            {squad.name}
          </span>
          {membersLabel && (
            <span className="truncate text-text-tertiary typo-caption2">
              {membersLabel}
            </span>
          )}
        </a>
      </div>
      {showJoinButton && <SquadRowJoinButton squad={squad} />}
    </div>
  );
};

export const TopSquadsGridCard = forwardRef(function TopSquadsGridCard(
  {
    post,
    domProps = {},
    children,
    squads = [],
    isPending = false,
  }: TopSquadsGridCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        // We deliberately skip `CardOverlay`: each row owns its own link, and
        // the inner list needs to receive scroll/click events without being
        // shadowed by a full-card anchor.
        className: classNames(
          className,
          'h-full overflow-hidden !border-0 !bg-surface-float !p-0',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt: post.pinnedAt, trending: post.trending }}
      bookmarked={post.bookmarked}
    >
      <div className="absolute inset-0 flex flex-col p-3 laptop:p-4">
        <header className="mb-3">
          <h2 className="font-bold text-text-primary typo-title3">
            Top active squads
          </h2>
          <p className="mt-1 text-text-tertiary typo-caption2">
            Most active public squads over the last 30 days
          </p>
        </header>
        <div className="no-scrollbar grid min-h-0 flex-1 grid-cols-1 gap-x-2 overflow-y-auto pr-1 laptop:grid-cols-2">
          {isPending && squads.length === 0
            ? SKELETON_KEYS.map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-3 px-2 py-2"
                  aria-hidden
                >
                  <span className="size-4 animate-pulse rounded-8 bg-surface-hover" />
                  <span className="size-10 shrink-0 animate-pulse rounded-full bg-surface-hover" />
                  <span className="h-3 w-32 animate-pulse rounded-8 bg-surface-hover" />
                </div>
              ))
            : squads.map((squad, index) => (
                <SquadRow key={squad.id} squad={squad} rank={index + 1} />
              ))}
        </div>
        {children}
      </div>
    </FeedItemContainer>
  );
});

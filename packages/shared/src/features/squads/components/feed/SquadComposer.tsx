import type { MouseEvent, ReactElement } from 'react';
import classNames from 'classnames';
import React from 'react';
import { SourcePostModerationStatus } from '../../../../graphql/squads';
import type { ComposerKind } from '../../../../components/post/composer/types';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  ArrowIcon,
  DocsIcon,
  LinkIcon,
  LockIcon,
  PollIcon,
  TimerIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import Link from '../../../../components/utilities/Link';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { useSquadPendingPosts } from '../../../../hooks/squads/useSquadPendingPosts';
import { useSquadPageContext } from '../../SquadPageContext';
import {
  getSquadPostingState,
  isStaffViewer,
  SquadViewer,
} from '../../lib/viewer';
import { getSquadPendingPostsUrl, getSquadRulesUrl } from '../../lib/routes';

const pendingStatus = [SourcePostModerationStatus.Pending];

const SquadOwnPendingPosts = (): ReactElement | null => {
  const { squad, viewer } = useSquadPageContext();
  const { count } = useSquadPendingPosts({
    squadId: squad.id,
    status: pendingStatus,
    enabled: viewer === SquadViewer.Member && squad.moderationRequired,
  });

  if (!count) {
    return null;
  }

  const url = getSquadPendingPostsUrl(squad.handle);

  return (
    <Link href={url} passHref>
      <a
        href={url}
        className="mx-4 flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2 text-text-secondary typo-footnote hover:text-text-primary tablet:mx-0"
      >
        <TimerIcon size={IconSize.Small} className="text-text-tertiary" />
        <span className="min-w-0 flex-1">
          <strong className="tabular-nums text-text-primary">{count}</strong> of
          your posts {count === 1 ? 'is' : 'are'} waiting for a moderator
        </span>
        <ArrowIcon size={IconSize.XSmall} className="rotate-90" />
      </a>
    </Link>
  );
};

const shortcuts: { kind: ComposerKind; label: string; icon: ReactElement }[] = [
  { kind: 'link', label: 'Share a link', icon: <LinkIcon /> },
  { kind: 'poll', label: 'Poll', icon: <PollIcon /> },
];

// The lock card and the composer are one row of the same height, so the
// server's logged out render and the viewer's own render swap without moving
// the feed, and a visitor's lock card stays slim.
const composerBoxClassName =
  'mx-4 flex min-h-14 items-center rounded-16 border border-border-subtlest-tertiary bg-surface-float tablet:mx-0';

const ComposerEntry = ({
  canPoll,
  isReviewed,
}: {
  canPoll: boolean;
  isReviewed: boolean;
}): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const rulesUrl = getSquadRulesUrl(squad.handle);
  const openComposer = (initialKind: ComposerKind) =>
    openModal({
      type: LazyModal.SmartComposer,
      props: { initialSquadHandle: squad.handle, initialKind },
    });

  return (
    <div
      role="presentation"
      onClick={() => openComposer('text')}
      className={classNames(
        composerBoxClassName,
        'cursor-text pl-4 pr-2 hover:border-border-subtlest-secondary tablet:gap-1',
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 self-stretch text-left"
      >
        {user && (
          <ProfilePicture
            user={user}
            size={ProfileImageSize.Medium}
            nativeLazyLoading
          />
        )}
        <span className="min-w-0 flex-1 truncate text-text-quaternary typo-body">
          What&apos;s on your mind?
        </span>
      </button>
      {shortcuts
        .filter(({ kind }) => canPoll || kind !== 'poll')
        .map(({ kind, label, icon }) => (
          <Button
            key={kind}
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={React.cloneElement(icon, { size: IconSize.Size16 })}
            aria-label={label}
            className="!px-2 text-text-tertiary"
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              openComposer(kind);
            }}
          >
            <span className="hidden tablet:inline">{label}</span>
          </Button>
        ))}
      {isReviewed && (
        <Tooltip content="Posts are reviewed by a moderator before they go live.">
          <span
            role="img"
            aria-label="Reviewed before it goes live"
            className="hidden size-8 items-center justify-center text-text-quaternary tablet:flex"
          >
            <TimerIcon size={IconSize.Size16} />
          </span>
        </Tooltip>
      )}
      {!!squad.rules?.length && (
        <Tooltip content="Read the rules">
          <Link href={rulesUrl} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<DocsIcon size={IconSize.Size16} />}
              aria-label="Read the rules"
              className="text-text-tertiary"
              onClick={(event: MouseEvent) => event.stopPropagation()}
            />
          </Link>
        </Tooltip>
      )}
    </div>
  );
};

export const SquadComposer = (): ReactElement => {
  const { squad, viewer } = useSquadPageContext();
  const { canPost, reason, isReviewed } = getSquadPostingState(squad, viewer);

  return (
    <div className="flex flex-col gap-3">
      <SquadOwnPendingPosts />
      {canPost ? (
        <ComposerEntry
          canPoll={isStaffViewer(viewer)}
          isReviewed={isReviewed}
        />
      ) : (
        <div
          className={classNames(
            composerBoxClassName,
            'gap-2 px-4 py-3 text-text-quaternary typo-callout',
          )}
        >
          <LockIcon size={IconSize.Small} className="shrink-0" />
          {reason}
        </div>
      )}
    </div>
  );
};

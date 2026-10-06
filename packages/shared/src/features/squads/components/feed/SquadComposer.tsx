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

// The lock card and the composer share a height, so the server's logged out
// render and the viewer's own render swap without moving the feed.
const composerBoxClassName =
  'mx-4 flex min-h-24 rounded-16 border border-border-subtlest-tertiary bg-surface-float tablet:mx-0';

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
        'cursor-text flex-col hover:border-border-subtlest-secondary',
      )}
    >
      <button
        type="button"
        className="flex items-center gap-3 px-4 pb-2 pt-3 text-left"
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
      <div className="flex items-center gap-1 px-3 pb-2 tablet:pl-[3.75rem]">
        {shortcuts
          .filter(({ kind }) => canPoll || kind !== 'poll')
          .map(({ kind, label, icon }) => (
            <Button
              key={kind}
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={React.cloneElement(icon, { size: IconSize.Size16 })}
              className="!px-2 text-text-tertiary"
              onClick={(event: MouseEvent) => {
                event.stopPropagation();
                openComposer(kind);
              }}
            >
              {label}
            </Button>
          ))}
        <div className="ml-auto flex items-center gap-3 pr-1 text-text-quaternary typo-caption1">
          {isReviewed && (
            <span
              title="Posts are reviewed by a moderator before they go live."
              className="hidden items-center gap-1.5 tablet:flex"
            >
              <TimerIcon size={IconSize.Size16} />
              Reviewed before it goes live
            </span>
          )}
          {!!squad.rules?.length && (
            <Link href={rulesUrl} passHref>
              <a
                href={rulesUrl}
                onClick={(event) => event.stopPropagation()}
                className="flex items-center gap-1.5 hover:text-text-primary"
              >
                <DocsIcon size={IconSize.Size16} />
                Read the rules
              </a>
            </Link>
          )}
        </div>
      </div>
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
            'items-center gap-2 px-4 py-3 text-text-quaternary typo-callout',
          )}
        >
          <LockIcon size={IconSize.Small} className="shrink-0" />
          {reason}
        </div>
      )}
    </div>
  );
};

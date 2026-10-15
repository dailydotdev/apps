import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { ReputationUserBadge } from '../../../../components/ReputationUserBadge';
import { IconSize } from '../../../../components/Icon';
import { ArrowIcon } from '../../../../components/icons/Arrow';
import { useAuthContext } from '../../../../contexts/AuthContext';
import type { LfgReachOut } from '../../types';
import { lfgInboxQueryOptions } from '../../queries';
import { getLfgReachOutUrl, lfgRelativeDays } from '../../lib/format';
import { useLfgEnabled } from '../../hooks/useLfgEnabled';
import { LfgContextCard } from '../LfgContextCard';
import { LfgAvatarBadge } from '../LfgAvatarBadge';

// Waiting reach-outs to the viewer's posts, for the Requests tab's count.
export const useLfgRequestCount = (): number => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const { data } = useQuery(
    lfgInboxQueryOptions(user, false, { enabled: isEnabled }),
  );

  return data?.length ?? 0;
};

// Filtered ones count too: the folder is still something to look at.
export const useLfgRequestsState = (): {
  hasRequests: boolean;
  isPending: boolean;
} => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const inbox = useQuery(
    lfgInboxQueryOptions(user, false, { enabled: isEnabled }),
  );
  const filtered = useQuery(
    lfgInboxQueryOptions(user, true, { enabled: isEnabled }),
  );

  return {
    hasRequests: !!inbox.data?.length || !!filtered.data?.length,
    isPending: isEnabled && (inbox.isPending || filtered.isPending),
  };
};

const RequestRow = ({
  reachOut,
  isActive,
}: {
  reachOut: LfgReachOut;
  isActive: boolean;
}): ReactElement => {
  const { sender } = reachOut;
  const href = getLfgReachOutUrl(reachOut.id);

  return (
    <Link href={href} passHref>
      <a
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={classNames(
          'flex items-center gap-3 rounded-12 px-3 py-2.5 transition-colors hover:bg-surface-hover',
          isActive && 'bg-surface-float',
        )}
      >
        <LfgAvatarBadge kind={sender.lfgKind} name={sender.name}>
          <ProfilePicture
            user={sender}
            size={ProfileImageSize.Large}
            nativeLazyLoading
          />
        </LfgAvatarBadge>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1">
            <Typography type={TypographyType.Callout} bold truncate>
              {sender.name}
            </Typography>
            <ReputationUserBadge user={sender} disableTooltip />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="ml-auto shrink-0"
            >
              {lfgRelativeDays(reachOut.createdAt)}
            </Typography>
          </span>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            truncate
          >
            {reachOut.pitch}
          </Typography>
        </span>
      </a>
    </Link>
  );
};

// Reach-outs to the viewer's posts lead the Requests tab, grouped under the
// post they answer. The ones that looked like spam wait in a folder.
export const LfgRequestSection = ({
  activeReachOutId,
}: {
  activeReachOutId?: string;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { isEnabled } = useLfgEnabled();
  const [isFilteredOpen, setFilteredOpen] = useState(false);
  const { data: waiting = [] } = useQuery(
    lfgInboxQueryOptions(user, false, { enabled: isEnabled }),
  );
  const { data: filtered = [] } = useQuery(
    lfgInboxQueryOptions(user, true, { enabled: isEnabled }),
  );
  const groups = useMemo(() => {
    const byPost = new Map<string, LfgReachOut[]>();

    waiting.forEach((reachOut) => {
      byPost.set(reachOut.post.id, [
        ...(byPost.get(reachOut.post.id) ?? []),
        reachOut,
      ]);
    });

    return [...byPost.values()];
  }, [waiting]);

  if (!isEnabled || (!waiting.length && !filtered.length)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 px-2 pb-4">
      {groups.map((reachOuts) => {
        const [{ post }] = reachOuts;

        return (
          <div key={post.id} className="flex flex-col gap-1">
            <LfgContextCard
              post={post}
              label={`Responses to your post · ${reachOuts.length}`}
              className="mb-1"
            />
            {reachOuts.map((reachOut) => (
              <RequestRow
                key={reachOut.id}
                reachOut={reachOut}
                isActive={reachOut.id === activeReachOutId}
              />
            ))}
          </div>
        );
      })}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-border-subtlest-tertiary pt-3">
          <button
            type="button"
            aria-expanded={isFilteredOpen}
            onClick={() => setFilteredOpen((value) => !value)}
            className="flex items-center justify-between rounded-12 px-3 py-2 text-left hover:bg-surface-hover"
          >
            <span className="flex flex-col">
              <Typography type={TypographyType.Footnote} bold>
                Filtered ({filtered.length})
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Requests that look like spam. They don&apos;t notify you.
              </Typography>
            </span>
            <ArrowIcon
              className={isFilteredOpen ? 'rotate-0' : 'rotate-180'}
              size={IconSize.Size16}
            />
          </button>
          {isFilteredOpen &&
            filtered.map((reachOut) => (
              <RequestRow
                key={reachOut.id}
                reachOut={reachOut}
                isActive={reachOut.id === activeReachOutId}
              />
            ))}
        </div>
      )}
    </div>
  );
};

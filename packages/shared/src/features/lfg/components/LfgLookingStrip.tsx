import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import Link from '../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { IconSize } from '../../../components/Icon';
import { SignalIcon } from '../../../components/icons/Signal';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import type { Origin } from '../../../lib/log';
import { LogEvent, TargetType } from '../../../lib/log';
import type { LfgKind } from '../types';
import { lfgKindLooking } from '../constants';
import { myLfgPostQueryOptions, userLfgPostQueryOptions } from '../queries';
import { getLfgUrl, lfgNewPostUrl } from '../lib/format';
import { useLfgEnabled } from '../hooks/useLfgEnabled';

const LookingLabel = ({ kind }: { kind: LfgKind }): ReactElement => (
  <span className="flex items-center gap-1.5 font-bold text-accent-avocado-default typo-footnote">
    <SignalIcon size={IconSize.Size16} secondary />
    {lfgKindLooking[kind]}
  </span>
);

// Before launch the badge is a teaser: it says what kind of post someone has
// without showing it, and invites the reader to post too.
export const LfgLookingTeaser = ({
  kind,
  origin,
  className,
}: {
  kind: LfgKind;
  origin: Origin;
  className?: string;
}): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { data: myPost, isPending } = useQuery(myLfgPostQueryOptions(user));
  const canPost = !isPending && !myPost;

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <LookingLabel kind={kind} />
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Connections open in a few days.
        {canPost && ' Post what you need and wear the badge too.'}
      </Typography>
      {canPost && (
        <Link href={lfgNewPostUrl} passHref>
          <Button
            tag="a"
            className="self-start"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() =>
              logEvent({
                event_name: LogEvent.ClickLfgStrip,
                extra: JSON.stringify({ origin, action: 'post yours' }),
              })
            }
          >
            Post yours
          </Button>
        </Link>
      )}
    </div>
  );
};

// The strip a hover card and a profile show for someone with an open post.
export const LfgLookingStrip = ({
  userId,
  kind,
  origin,
  className,
}: {
  userId: string;
  kind: LfgKind;
  origin: Origin;
  className?: string;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isLaunched } = useLfgEnabled();
  const isMe = user?.id === userId;
  const showsPost = isLaunched || isMe;
  const { data: post } = useQuery(
    userLfgPostQueryOptions(user, userId, { enabled: showsPost }),
  );

  if (!showsPost) {
    return (
      <LfgLookingTeaser kind={kind} origin={origin} className={className} />
    );
  }

  if (!post) {
    return null;
  }

  const href = getLfgUrl(post.id);

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <LookingLabel kind={post.kind} />
      <Typography
        type={TypographyType.Callout}
        bold
        className="line-clamp-2 break-words"
      >
        {post.title}
      </Typography>
      <Link href={href} passHref>
        <Button
          tag="a"
          className="self-start"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() =>
            logEvent({
              event_name: LogEvent.ClickLfgStrip,
              target_type: TargetType.LfgPost,
              target_id: post.id,
              extra: JSON.stringify({ origin, action: 'view post' }),
            })
          }
        >
          View post
        </Button>
      </Link>
    </div>
  );
};

// The hover card's footer: nothing unless the person is looking and the
// reader has Looking for group.
export const LfgHoverCardStrip = ({
  userId,
  kind,
  origin,
}: {
  userId?: string;
  kind?: LfgKind | null;
  origin: Origin;
}): ReactElement | null => {
  const { isEnabled } = useLfgEnabled();

  if (!isEnabled || !kind || !userId) {
    return null;
  }

  return (
    <LfgLookingStrip
      userId={userId}
      kind={kind}
      origin={origin}
      className="mt-1 border-t border-border-subtlest-tertiary pt-3"
    />
  );
};

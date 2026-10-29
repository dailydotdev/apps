import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from '../../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import CloseButton from '../../../../components/CloseButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { IconSize } from '../../../../components/Icon';
import { PlusIcon } from '../../../../components/icons/Plus';
import { SignalIcon } from '../../../../components/icons/Signal';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useActions } from '../../../../hooks/useActions';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import { ActionType } from '../../../../graphql/actions';
import { LogEvent } from '../../../../lib/log';
import type { LfgPost } from '../../types';
import { myLfgPostQueryOptions } from '../../queries';
import {
  getLfgReachOutUrl,
  getLfgUrl,
  lfgDaysLeft,
  lfgNewPostUrl,
} from '../../lib/format';
import { useLfgEnabled } from '../../hooks/useLfgEnabled';

const cardClassName =
  'mx-4 mb-3 flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3';

const LfgLabel = (): ReactElement => (
  <span className="flex flex-1 items-center gap-1.5 font-bold text-accent-avocado-default typo-footnote">
    <SignalIcon size={IconSize.Size16} secondary />
    Looking for group
  </span>
);

const LfgPostStatusCard = ({ post }: { post: LfgPost }): ReactElement => {
  const waiting = post.pendingCount ?? 0;
  const daysLeft = lfgDaysLeft(post.expiresAt);

  return (
    <div className={cardClassName}>
      <LfgLabel />
      <Link href={getLfgUrl(post.id)} passHref>
        <a href={getLfgUrl(post.id)} className="flex flex-col">
          <Typography type={TypographyType.Callout} bold truncate>
            {post.title}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
          >
            {waiting ? `${waiting} waiting` : 'No responses yet'} · {daysLeft}{' '}
            {daysLeft === 1 ? 'day' : 'days'} left
          </Typography>
        </a>
      </Link>
      <div className="flex gap-2">
        {waiting > 0 && (
          <Link href={getLfgReachOutUrl()} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
            >
              Review {waiting}
            </Button>
          </Link>
        )}
        <Link href={getLfgUrl()} passHref>
          <Button tag="a" variant={ButtonVariant.Float} size={ButtonSize.Small}>
            Board
          </Button>
        </Link>
      </div>
    </div>
  );
};

// The inbox is where Looking for group pays off: an open post shows how it's
// doing, and people who haven't posted get an invite they can dismiss.
export const LfgMessagesPromo = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isEnabled } = useLfgEnabled();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const isDismissed = checkHasCompleted(ActionType.DismissLfgMessagesPromo);
  const { data: myPost, isPending } = useQuery(
    myLfgPostQueryOptions(user, { enabled: isEnabled }),
  );
  const isInviteVisible =
    isEnabled && isActionsFetched && !isDismissed && !isPending && !myPost;

  useLogEventOnce(() => ({ event_name: LogEvent.ImpressionLfgMessagesPromo }), {
    condition: isInviteVisible,
  });

  if (isEnabled && myPost) {
    return <LfgPostStatusCard post={myPost} />;
  }

  if (!isInviteVisible) {
    return null;
  }

  const onDismiss = () => {
    logEvent({ event_name: LogEvent.DismissLfgMessagesPromo });
    completeAction(ActionType.DismissLfgMessagesPromo);
  };

  const onClick = (cta: string) =>
    logEvent({
      event_name: LogEvent.ClickLfgMessagesPromo,
      extra: JSON.stringify({ cta }),
    });

  return (
    <div className={cardClassName}>
      <div className="flex items-center gap-2">
        <LfgLabel />
        <CloseButton
          size={ButtonSize.XSmall}
          aria-label="Dismiss Looking for group"
          onClick={onDismiss}
        />
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
      >
        Pairing with AI more than people? Find devs to build, learn or get
        unstuck with.
      </Typography>
      <div className="flex gap-2">
        <Link href={lfgNewPostUrl} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            onClick={() => onClick('new post')}
          >
            New post
          </Button>
        </Link>
        <Link href={getLfgUrl()} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => onClick('board')}
          >
            Browse board
          </Button>
        </Link>
      </div>
    </div>
  );
};

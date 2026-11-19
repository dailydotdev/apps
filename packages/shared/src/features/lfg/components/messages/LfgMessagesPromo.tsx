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
import { myLfgPostQueryOptions } from '../../queries';
import { getLfgUrl, lfgNewPostUrl } from '../../lib/format';
import { useLfgEnabled } from '../../hooks/useLfgEnabled';
import { LfgYourPostCard } from '../LfgYourPostCard';

const cardClassName =
  'mx-4 mb-3 flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3';

const LfgLabel = (): ReactElement => (
  <span className="flex flex-1 items-center gap-1.5 font-bold text-accent-avocado-default typo-footnote">
    <SignalIcon size={IconSize.Size16} secondary />
    Looking for group
  </span>
);

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
    return (
      <LfgYourPostCard
        post={myPost}
        label={<LfgLabel />}
        className="mx-4 mb-3"
        showBoardLink
      />
    );
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

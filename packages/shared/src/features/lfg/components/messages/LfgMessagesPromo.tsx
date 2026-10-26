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
import { SignalIcon } from '../../../../components/icons/Signal';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useLogContext } from '../../../../contexts/LogContext';
import { useActions } from '../../../../hooks/useActions';
import useLogEventOnce from '../../../../hooks/log/useLogEventOnce';
import { ActionType } from '../../../../graphql/actions';
import { LogEvent } from '../../../../lib/log';
import { myLfgPostQueryOptions } from '../../queries';
import { getLfgUrl } from '../../lib/format';
import { useLfgEnabled } from '../../hooks/useLfgEnabled';

// The inbox is where Looking for group pays off, so it invites people who
// have not posted yet. Once dismissed it stays gone.
export const LfgMessagesPromo = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isEnabled } = useLfgEnabled();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const isDismissed = checkHasCompleted(ActionType.DismissLfgMessagesPromo);
  const canShow = isEnabled && isActionsFetched && !isDismissed;
  const { data: myPost, isPending } = useQuery(
    myLfgPostQueryOptions(user, { enabled: canShow }),
  );
  const isVisible = canShow && !isPending && !myPost;

  useLogEventOnce(() => ({ event_name: LogEvent.ImpressionLfgMessagesPromo }), {
    condition: isVisible,
  });

  if (!isVisible) {
    return null;
  }

  const onDismiss = () => {
    logEvent({ event_name: LogEvent.DismissLfgMessagesPromo });
    completeAction(ActionType.DismissLfgMessagesPromo);
  };

  return (
    <div className="mx-4 mb-3 flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3">
      <div className="flex items-center gap-2">
        <span className="flex flex-1 items-center gap-1.5 font-bold text-accent-avocado-default typo-footnote">
          <SignalIcon size={IconSize.Size16} secondary />
          Looking for group
        </span>
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
      <Link href={getLfgUrl()} passHref>
        <Button
          tag="a"
          className="self-start"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() =>
            logEvent({ event_name: LogEvent.ClickLfgMessagesPromo })
          }
        >
          Find your people
        </Button>
      </Link>
    </div>
  );
};

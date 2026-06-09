import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MoveToIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent } from '../../../lib/log';

interface GivebackStartPanelProps {
  // Fires once an authenticated visitor opts in, to reveal the cause picker.
  onJoin: () => void;
}

// Hero gateway: one clear decision above the fold — "do you want to join?".
// Logged-out visitors get the login prompt first; authenticated visitors opt in.
export const GivebackStartPanel = ({
  onJoin,
}: GivebackStartPanelProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();

  const handleJoin = () => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.Giveback });
      return;
    }

    // A logged-out click opens login instead, so the join event fires here only.
    logEvent({ event_name: LogEvent.ClickJoinGiveback });
    onJoin();
  };

  return (
    <FlexCol className="gap-4">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
      >
        Take small actions and we turn them into{' '}
        <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
          real donations
        </span>
        . daily.dev funds every cent, so you never pay.
      </Typography>

      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Large}
        icon={<MoveToIcon size={IconSize.Size16} />}
        iconPosition={ButtonIconPosition.Right}
        onClick={handleJoin}
        className="shadow-2-cabbage transition-transform duration-200 ease-out hover:scale-[1.02]"
      >
        Join the campaign
      </Button>
    </FlexCol>
  );
};

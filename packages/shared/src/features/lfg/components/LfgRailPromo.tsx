import type { ReactElement } from 'react';
import React from 'react';
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
import { WidgetContainer } from '../../../components/widgets/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import type { Origin } from '../../../lib/log';
import { LogEvent } from '../../../lib/log';
import { myLfgPostQueryOptions } from '../queries';
import { getLfgUrl } from '../lib/format';
import { useLfgEnabled } from '../hooks/useLfgEnabled';

// The post rail's invite to Looking for group, for people who have not posted
// yet.
export const LfgRailPromo = ({
  origin,
}: {
  origin: Origin;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { isEnabled } = useLfgEnabled();
  const { data: myPost, isPending } = useQuery(
    myLfgPostQueryOptions(user, { enabled: isEnabled }),
  );
  const isVisible = isEnabled && !isPending && !myPost;
  const extra = JSON.stringify({ origin });

  useLogEventOnce(
    () => ({ event_name: LogEvent.ImpressionLfgRailPromo, extra }),
    { condition: isVisible },
  );

  if (!isVisible) {
    return null;
  }

  return (
    <WidgetContainer className="flex flex-col gap-2 p-4">
      <span className="flex items-center gap-1.5 font-bold text-accent-avocado-default typo-callout">
        <SignalIcon size={IconSize.Size16} secondary />
        Looking for group
      </span>
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
          className="mt-1 self-start"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() =>
            logEvent({ event_name: LogEvent.ClickLfgRailPromo, extra })
          }
        >
          Find your people
        </Button>
      </Link>
    </WidgetContainer>
  );
};

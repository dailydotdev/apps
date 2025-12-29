import React from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { AddUserIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import Link from '../../../components/utilities/Link';
import { anchorDefaultRel } from '../../../lib/strings';
import { recruiterUrl } from '../../../lib/constants';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

export const OpportunityHiring = (): ReactElement => {
  const { logEvent } = useLogContext();

  return (
    <div className="flex flex-col gap-6 rounded-16 border-border-subtlest-secondary px-4 py-6 laptop:border">
      <div className="flex flex-col gap-1">
        <Typography
          type={TypographyType.Body}
          bold
          color={TypographyColor.Primary}
        >
          Are you hiring?
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Find your next teammate here. Post open roles and reach developers who
          use daily.dev every day.
        </Typography>
      </div>
      <Link href={recruiterUrl} passHref>
        <Button
          tag="a"
          size={ButtonSize.Large}
          variant={ButtonVariant.Subtle}
          icon={<AddUserIcon size={IconSize.Small} />}
          rel={anchorDefaultRel}
          className="w-full"
          onClick={() => {
            logEvent({
              event_name: LogEvent.ClickStartHiring,
            });
          }}
        >
          Start hiring
        </Button>
      </Link>
    </div>
  );
};

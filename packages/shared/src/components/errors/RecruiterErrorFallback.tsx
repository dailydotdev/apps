import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import { CalendarIcon, MailIcon, WarningIcon } from '../icons';
import { anchorDefaultRel } from '../../lib/strings';
import { recruiterScheduleUrl } from '../../lib/constants';
import { IconSize } from '../Icon';

function RecruiterErrorFallback(): ReactElement {
  const [hasIntercom, setHasIntercom] = useState(false);

  useEffect(() => {
    setHasIntercom(typeof window !== 'undefined' && !!window.Intercom);
  }, []);

  const handleOpenIntercom = () => {
    if (window.Intercom) {
      window.Intercom('show');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="flex max-w-[24rem] flex-col items-center gap-6 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-8 text-center shadow-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-status-warning">
          <WarningIcon size={IconSize.Large} className="text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Title1} bold>
            Something went wrong
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            We&apos;re sorry, but something unexpected happened. Our team has
            been notified. Please reach out if you need immediate assistance.
          </Typography>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Button
            variant={ButtonVariant.Primary}
            className="w-full"
            icon={<CalendarIcon />}
            href={recruiterScheduleUrl}
            target="_blank"
            rel={anchorDefaultRel}
            tag="a"
          >
            Schedule a call with us
          </Button>
          {hasIntercom && (
            <Button
              variant={ButtonVariant.Tertiary}
              className="w-full"
              icon={<MailIcon />}
              onClick={handleOpenIntercom}
            >
              Chat with support
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterErrorFallback;

import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { cloudinaryOnboardingActivationDemo } from '../../../lib/image';

type NewTabActivationPrimerProps = {
  onComplete: () => void;
};

// Aspect ratio matches source dimensions so the element hugs the frame.
const DEMO_URL = cloudinaryOnboardingActivationDemo; // 1748×1080

function ActivationDemoVideo(): ReactElement {
  return (
    <video
      src={DEMO_URL}
      className="aspect-[1748/1080] w-full max-w-[43rem] rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2"
      muted
      autoPlay
      loop
      playsInline
      disablePictureInPicture
      controls={false}
      aria-label="Rehearsal of Chrome's confirmation bubble and the Keep it click"
    />
  );
}

export function NewTabActivationPrimer({
  onComplete,
}: NewTabActivationPrimerProps): ReactElement {
  const { logEvent } = useLogContext();

  useEffect(() => {
    logEvent({ event_name: LogEvent.ExtensionPrimerShown });
  }, [logEvent]);

  const handleContinue = useCallback((): void => {
    logEvent({ event_name: LogEvent.ExtensionPrimerCtaClick });
    onComplete();
  }, [logEvent, onComplete]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-[48rem] flex-col items-center gap-5 text-center">
        <div className="flex flex-col items-center gap-2">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
            className="text-balance"
          >
            Welcome! Let&apos;s activate your new tab.
          </Typography>

          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            className="text-balance"
          >
            Open a new tab and tap “Keep it” on the Chrome popup.
          </Typography>
        </div>

        <ActivationDemoVideo />

        <div className="flex flex-col items-center gap-4">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            onClick={handleContinue}
          >
            Continue
          </Button>
          <p className="text-text-tertiary typo-callout">
            Takes 2 seconds. Reversible anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

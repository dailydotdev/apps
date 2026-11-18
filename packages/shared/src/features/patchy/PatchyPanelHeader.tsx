import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { ArrowIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import Link from '../../components/utilities/Link';
import { useLogContext } from '../../contexts/LogContext';
import { webappUrl } from '../../lib/constants';
import { LogEvent, TargetType } from '../../lib/log';
import { patchyDenImage } from './patchyAssets';
import type { PatchyMood } from './patchyTriggers';
import { patchyMoodCopy } from './patchyTriggers';

interface PatchyPanelHeaderProps {
  mood: PatchyMood;
  onNavigate?: () => void;
}

// Top of the Streak panel when Patchy is on: him in his armchair, his mood,
// and the way into his den on Game Center.
export const PatchyPanelHeader = ({
  mood,
  onNavigate,
}: PatchyPanelHeaderProps): ReactElement => {
  const { logEvent } = useLogContext();
  const isAsleep = mood === 'away' || mood === 'resting';

  return (
    <div className="mx-3 mb-3 flex items-center gap-3 rounded-16 bg-surface-float p-2 pr-3">
      <img
        src={isAsleep ? patchyDenImage.blink : patchyDenImage.idle}
        alt="Patchy"
        className="h-20 w-auto shrink-0"
        draggable={false}
      />
      <div className="flex min-w-0 flex-col items-start gap-2">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {patchyMoodCopy[mood]}
        </Typography>
        <Link href={`${webappUrl}game-center`} passHref>
          <Button
            tag="a"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Primary}
            icon={<ArrowIcon className="rotate-90" size={IconSize.Size16} />}
            iconPosition={ButtonIconPosition.Right}
            onClick={() => {
              logEvent({
                event_name: LogEvent.Click,
                target_type: TargetType.PatchyDen,
              });
              onNavigate?.();
            }}
          >
            Visit Patchy&apos;s den
          </Button>
        </Link>
      </div>
    </div>
  );
};

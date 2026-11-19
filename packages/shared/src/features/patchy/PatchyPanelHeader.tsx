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
import type { PatchyMood } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';
import { PatchyMenu } from './PatchyMenu';

interface PatchyPanelHeaderProps {
  mood: PatchyMood;
  onNavigate?: () => void;
}

// Top of the Streak panel when Patchy is on: his face, his mood, what you
// can ask him for, and the way into his den on Game Center.
export const PatchyPanelHeader = ({
  mood,
  onNavigate,
}: PatchyPanelHeaderProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { faceImage, moods } = getPatchyConfig();
  return (
    // mx-4 lines the card up with the streak hero's px-4 below it.
    <div className="mx-4 mb-2 mt-1 flex flex-col gap-2 rounded-16 bg-surface-float p-2">
      <div className="flex items-center gap-2">
        <img
          src={faceImage[moods[mood].face]}
          alt="Patchy"
          className="size-12 shrink-0 rounded-full"
          draggable={false}
        />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="min-w-0 flex-1"
        >
          {moods[mood].copy}
        </Typography>
      </div>
      <PatchyMenu onNavigate={onNavigate} />
      <Link href={`${webappUrl}game-center`} passHref>
        <Button
          tag="a"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Primary}
          icon={<ArrowIcon className="rotate-90" size={IconSize.Size16} />}
          iconPosition={ButtonIconPosition.Right}
          className="w-full"
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
  );
};

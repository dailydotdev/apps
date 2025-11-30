import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import classed from '../../lib/classed';
import { ClickableText } from '../buttons/ClickableText';
import { PlayPauseIcon } from '../icons/PlayPause';
import { Button, ButtonSize } from '../buttons/Button';

const Card = classed(
  'div',
  'rounded-8 border border-border-subtlest-tertiary bg-background-subtle transition-all duration-300 ease-out',
);

export type Tip = {
  id: string;
  video: string;
  videoThumbnail?: string;
  description: string;
};

export const mockTips: Tip[] = [
  {
    id: '1',
    video:
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    videoThumbnail:
      'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg',
    description: 'Let candidates know the salary range',
  },
  {
    id: '2',
    video:
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    videoThumbnail:
      'https://images.pexels.com/photos/4498366/pexels-photo-4498366.jpeg?_gl=1*9kleh5*_ga*NTI0ODYyNjY2LjE3NTU2OTY2ODE.*_ga_8JE65Q40S6*czE3NjQ0MzAwMzYkbzkkZzEkdDE3NjQ0MzA2NDIkajQ2JGwwJGgw',
    description: 'Write clear job requirements',
  },
  {
    id: '3',
    video:
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    videoThumbnail:
      'https://images.pexels.com/photos/6844155/pexels-photo-6844155.jpeg',
    description: 'Respond to applicants quickly',
  },
];

export const MAX_VISIBLE_TIPS = 3;

const STACK_OFFSET = 10;

const SCALE_FACTOR = 0.065;

export type TipCardProps = {
  tip: Tip;
  stackIndex: number;
  totalTips: number;
  isDismissing?: boolean;
  onSkip?: () => void;
};

export const TipCard = ({
  tip,
  stackIndex,
  totalTips,
  isDismissing = false,
  onSkip,
}: TipCardProps): ReactElement => {
  const topOffset = (totalTips - 1 - stackIndex) * STACK_OFFSET;
  const scale = 1 - stackIndex * SCALE_FACTOR;

  const dismissStyle = isDismissing
    ? {
        top: -20,
        transform: `scale(${scale + 0.05})`,
        opacity: 0,
      }
    : {
        top: topOffset,
        transform: `scale(${scale})`,
        opacity: 1,
      };

  // Hide content of back cards (index >= 2) to prevent content being visible during transitions.
  const isBackCard = stackIndex >= 2;
  const contentOpacity = isBackCard ? 0 : 1;

  return (
    <Card
      className={classNames('absolute left-0 right-0 overflow-hidden')}
      style={{
        ...dismissStyle,
        transformOrigin: 'top center',
        zIndex: MAX_VISIBLE_TIPS - stackIndex,
      }}
    >
      <div
        className="flex flex-col gap-2 px-3 py-2 transition-opacity duration-150"
        style={{ opacity: contentOpacity }}
      >
        <div className="flex flex-col gap-0">
          <Typography type={TypographyType.Footnote} bold>
            Recruiting tip
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {tip.description}
          </Typography>
        </div>
        <div className="relative h-[93px] w-full overflow-hidden rounded-8 bg-surface-secondary">
          <img
            src={tip.videoThumbnail}
            alt="Tip video thumbnail"
            className="h-full w-full rounded-8 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-overlay-quaternary-onion">
            <Button size={ButtonSize.XLarge} icon={<PlayPauseIcon />} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <ClickableText
            defaultTypo={false}
            className="!text-text-link hover:text-text-link"
          >
            <Typography type={TypographyType.Caption2}>Learn More</Typography>
          </ClickableText>
          <ClickableText
            defaultTypo={false}
            className="text-text-tertiary hover:text-text-tertiary"
            onClick={onSkip}
          >
            <Typography type={TypographyType.Caption2}>Skip</Typography>
          </ClickableText>
        </div>
      </div>
    </Card>
  );
};

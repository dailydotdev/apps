import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';
import { Typography, TypographyType } from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlayIcon } from '../icons';
import classed from '../../lib/classed';
import type { Source } from '../../graphql/sources';

interface YoutubeVideoWithoutConsentProps {
  className?: string;
  title: string;
  image: string;
  source: Source;
  onWatchVideo: () => void;
  onAcceptCookies: () => void;
}

const Container = classed(
  'div',
  'relative w-full overflow-hidden rounded-16 pt-[56.25%]',
);

const Background = classed(
  'div',
  'absolute inset-0 z-1 flex flex-col bg-surface-float p-6',
);

export function YoutubeVideoWithoutConsent({
  className,
  image,
  title,
  source,
  onWatchVideo,
  onAcceptCookies,
}: YoutubeVideoWithoutConsentProps): ReactElement {
  return (
    <Container className={classNames(className, 'relative')}>
      <img
        src={image}
        alt={title}
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.08]"
      />
      <Background>
        <span className="flex flex-row items-center gap-3">
          <Image
            src={source.image}
            alt={source.name}
            className="h-10 w-10 rounded-full"
          />
          <Typography type={TypographyType.Callout} bold>
            {source.name}
          </Typography>
        </span>
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <Typography type={TypographyType.Callout} className="text-center">
            To play this video here on daily.dev, you’ll need to enable
            marketing cookies, or you can choose to watch it on YouTube.
          </Typography>
          <Button
            variant={ButtonVariant.Primary}
            icon={<PlayIcon />}
            onClick={() => onAcceptCookies()}
          >
            Watch and accept cookies
          </Button>
        </div>
        <Button
          variant={ButtonVariant.Tertiary}
          className="mx-auto w-fit"
          size={ButtonSize.Small}
          onClick={onWatchVideo}
        >
          Watch on YouTube
        </Button>
      </Background>
    </Container>
  );
}

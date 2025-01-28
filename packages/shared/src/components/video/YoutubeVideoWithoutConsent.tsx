import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';
import { Typography, TypographyType } from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlayIcon } from '../icons';
import classed from '../../lib/classed';
import type { Post } from '../../graphql/posts';

export interface YoutubeVideoWithoutConsentProps {
  post: Post;
  className?: string;
  onWatchVideo: () => void;
  onAcceptCookies: () => void;
}

const Container = classed(
  'div',
  'relative w-full overflow-hidden rounded-16 pt-[56.25%]',
);

const Background = classed(
  'div',
  'absolute inset-0 z-1 flex flex-col bg-surface-float p-2 tablet:p-6',
);

export function YoutubeVideoWithoutConsent({
  className,
  onWatchVideo,
  onAcceptCookies,
  post,
}: YoutubeVideoWithoutConsentProps): ReactElement {
  const { title, image, source, permalink } = post;

  return (
    <Container className={classNames(className, 'relative')}>
      <img
        src={image}
        alt={title}
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-[0.08]"
      />
      <Background>
        <span className="hidden flex-row items-center gap-3 tablet:flex">
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
          tag="a"
          href={permalink}
          target="_blank"
        >
          Watch on YouTube
        </Button>
      </Background>
    </Container>
  );
}

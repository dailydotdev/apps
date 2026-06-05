import type { ReactElement, SyntheticEvent } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { fallbackImages } from '../../../lib/config';

interface GivebackReview {
  quote: string;
  author: string;
  handle: string;
  image: string;
}

// Real daily.dev profiles and avatars from our community. The short quotes are
// illustrative for the campaign demo; swap for consented testimonials at launch.
const reviews: GivebackReview[] = [
  {
    quote:
      'Proud of where this is going. Our budget is funding causes instead of ad auctions.',
    author: 'Ido Shamun',
    handle: '@idoshamun',
    image:
      'https://media.daily.dev/image/upload/s---xy_OAwk--/f_auto,q_auto/v1703781380/avatars/avatar_28849d86070e4c099c877ab6837c61f0',
  },
  {
    quote:
      'Backed open source in two clicks. This is how giving back should feel.',
    author: 'Nimrod Kramer',
    handle: '@kramer',
    image:
      'https://media.daily.dev/image/upload/v1682322243/avatars/avatar_1d339aa5b85c4e0ba85fdedb523c48d4.jpg',
  },
  {
    quote: 'Shared the launch with my audience. Zero cost to me, real impact.',
    author: 'Chris Bongers',
    handle: '@dailydevtips',
    image:
      'https://media.daily.dev/image/upload/s--9gxFz1e7--/f_auto/v1705902590/avatars/avatar_JUNiIGCV-?_a=BAMAMiZW0',
  },
  {
    quote:
      'Picked the causes I care about and the donation was already covered. Wild.',
    author: 'Ante Barić',
    handle: '@capjavert',
    image:
      'https://media.daily.dev/image/upload/v1679300599/avatars/avatar_LJSkpBexOSCWc8INyu3Eu.jpg',
  },
  {
    quote: 'Small actions, real money for good causes. Easy yes from me.',
    author: 'Amar',
    handle: '@amar',
    image:
      'https://media.daily.dev/image/upload/s--W1oZyHsz--/f_auto/v1719829173/avatars/avatar_0pjeBcFKQqsnU97ZOj9EW',
  },
  {
    quote: 'Love that the community gets to decide where the money goes.',
    author: 'Dave',
    handle: '@dave28',
    image:
      'https://media.daily.dev/image/upload/s--C7nUVtfM--/f_auto,q_auto/v1/avatars/avatar_14yFjmSDxLUrr05G27mp6',
  },
];

const onAvatarError = (event: SyntheticEvent<HTMLImageElement>): void => {
  const target = event.currentTarget;
  if (target.src !== fallbackImages.avatar) {
    target.src = fallbackImages.avatar;
  }
};

export const GivebackSocialProof = (): ReactElement => (
  <FlexCol className="w-full gap-4">
    <FlexRow className="items-center gap-2">
      <span className="size-2 rounded-full bg-status-success motion-safe:animate-glow-pulse" />
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        bold
        className="uppercase tracking-wider"
      >
        Live from the community
      </Typography>
    </FlexRow>

    <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
      {reviews.map((review) => (
        <FlexCol
          key={review.handle}
          className="group gap-3 rounded-16 border border-border-subtlest-tertiary p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-subtlest-secondary hover:shadow-2 motion-reduce:transform-none"
        >
          <FlexRow className="items-center gap-3">
            <img
              src={review.image}
              alt={review.author}
              loading="lazy"
              onError={onAvatarError}
              className="size-10 shrink-0 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <FlexCol className="min-w-0">
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                bold
                truncate
              >
                {review.author}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                truncate
              >
                {review.handle}
              </Typography>
            </FlexCol>
          </FlexRow>

          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            &ldquo;{review.quote}&rdquo;
          </Typography>
        </FlexCol>
      ))}
    </div>
  </FlexCol>
);

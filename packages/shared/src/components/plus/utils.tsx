import React from 'react';
import { VideoSlide } from '../containers/VideoSlide';
import {
  Typography,
  TypographyType,
  TypographyTag,
  TypographyColor,
} from '../typography/Typography';

export const plusSlides = [
  <div key={0} className="flex h-full flex-col">
    <div className="flex min-h-0 flex-1">
      <VideoSlide
        src="https://media.daily.dev/video/upload/v1741698572/videos/customfeeds.webm"
        className="pointer-events-none h-full w-full object-contain"
      />
    </div>
    <div className="mx-auto  max-w-sm flex-shrink-0 text-center">
      <Typography type={TypographyType.Title3} bold tag={TypographyTag.H3}>
        Advanced custom feeds
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        tag={TypographyTag.P}
      >
        Build the perfect feed for your needs with advanced filtering options,
        custom tags, and personalized recommendations.
      </Typography>
    </div>
  </div>,
  <div key={1} className="flex h-full flex-col">
    <div className="flex min-h-0 flex-1">
      <VideoSlide
        src="https://media.daily.dev/video/upload/v1741698572/videos/shield.webm"
        className="pointer-events-none h-full w-full object-contain"
      />
    </div>
    <div className="mx-auto max-w-sm flex-shrink-0 text-center">
      <Typography type={TypographyType.Title3} bold tag={TypographyTag.H3}>
        AI-powered clean titles
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        tag={TypographyTag.P}
      >
        Get clean, readable article titles powered by AI. No more clickbait or
        confusing headlines in your feed.
      </Typography>
    </div>
  </div>,
  <div key={2} className="flex h-full flex-col">
    <div className="flex min-h-0 flex-1">
      <VideoSlide
        src="https://media.daily.dev/video/upload/v1741273644/bookmarks_xybqxe.webm"
        className="pointer-events-none h-full w-full object-contain"
      />
    </div>
    <div className="mx-auto  max-w-sm flex-shrink-0 text-center">
      <Typography type={TypographyType.Title3} bold tag={TypographyTag.H3}>
        Bookmark folders
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        tag={TypographyTag.P}
      >
        Organize your saved articles with custom folders and tags. Never lose
        track of important content again.
      </Typography>
    </div>
  </div>,
  <div key={3} className="flex h-full flex-col">
    <div className="flex min-h-0 flex-1">
      <img
        className="pointer-events-none h-full w-full object-contain"
        src="https://media.daily.dev/image/upload/s--r2BZKWPk--/f_auto/v1741690961/public/Keyword%20filters"
        alt="Keyword filters"
      />
    </div>
    <div className="mx-auto  max-w-sm flex-shrink-0 text-center">
      <Typography type={TypographyType.Title3} bold tag={TypographyTag.H3}>
        Keyword filters
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        tag={TypographyTag.P}
      >
        Mute the buzzwords you&apos;re sick of hearing. More signal, less noise.
      </Typography>
    </div>
  </div>,
  <div key={4} className="flex h-full flex-col">
    <div className="flex min-h-0 flex-1">
      <img
        className="pointer-events-none h-full w-full object-contain"
        src="https://media.daily.dev/image/upload/s--jlfaLYq_--/f_auto/v1741690961/public/Ad-free%20experience"
        alt="Ad-free experience"
      />
    </div>
    <div className="mx-auto  max-w-sm flex-shrink-0 text-center">
      <Typography type={TypographyType.Title3} bold tag={TypographyTag.H3}>
        Ad-free experience
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        tag={TypographyTag.P}
      >
        Enjoy a clean, distraction-free reading experience. No ads, no
        interruptions.
      </Typography>
    </div>
  </div>,
];

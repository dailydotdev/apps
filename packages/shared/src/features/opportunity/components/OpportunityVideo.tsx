import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';

const VIDEO_ID = '80GzyJ3ejgU';

export const OpportunityVideo = (): ReactElement => {
  return (
    <FlexCol className="w-full gap-4 text-center">
      <Typography type={TypographyType.Title3} bold>
        See how it works
      </Typography>
      <div className="relative w-full overflow-hidden rounded-16 pt-[56.25%]">
        <iframe
          title="A developer-first way to find your next job"
          src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 aspect-video w-full border-0"
        />
      </div>
    </FlexCol>
  );
};

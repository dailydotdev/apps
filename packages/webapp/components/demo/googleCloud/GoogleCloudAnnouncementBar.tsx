import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { GoogleCloudLogo } from './GoogleCloudLogo';
import { GoogleCloudCta } from './GoogleCloudCta';
import { googleCloudMessage } from './content';
import { gcpHairline, gcpSurfaceBg } from './brand';

type GoogleCloudAnnouncementBarProps = {
  className?: string;
};

// A taller variant of the product announcement bar (roughly double the
// height of the standard single-line bar): logo + two-line message on the
// left, brand CTA on the right, dismissible via the shared CloseButton.
export const GoogleCloudAnnouncementBar = ({
  className,
}: GoogleCloudAnnouncementBarProps): ReactElement | null => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const { eyebrow, title, body, cta, ctaUrl } = googleCloudMessage;

  return (
    <div
      className={classNames(
        'relative flex min-h-[7.5rem] w-full items-center gap-4 overflow-hidden rounded-16 px-4 py-5 tablet:px-6',
        className,
      )}
      style={{ background: gcpSurfaceBg, border: gcpHairline }}
    >
      <div className="hidden size-16 shrink-0 items-center justify-center rounded-16 bg-background-default tablet:flex">
        <GoogleCloudLogo size={40} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wide"
        >
          {eyebrow}
        </Typography>
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
        >
          <GoogleCloudLogo
            size={20}
            className="mr-2 inline-block tablet:hidden"
          />
          {title}
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {body}
        </Typography>
        <GoogleCloudCta href={ctaUrl} className="mt-2 self-start tablet:hidden">
          {cta}
        </GoogleCloudCta>
      </div>
      <GoogleCloudCta href={ctaUrl} className="hidden tablet:inline-flex">
        {cta}
      </GoogleCloudCta>
      <CloseButton
        size={ButtonSize.Small}
        className="absolute right-2 top-2"
        onClick={() => setDismissed(true)}
      />
    </div>
  );
};

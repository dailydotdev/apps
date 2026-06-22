import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import CloseButton from '../../components/CloseButton';
import { ButtonSize } from '../../components/buttons/Button';
import { GoogleCloudLogo } from './GoogleCloudLogo';
import { GoogleCloudCta } from './GoogleCloudCta';
import { googleCloudMessage } from './content';
import { gcpHairline, gcpSurfaceBg } from './brand';

type GoogleCloudAnnouncementBarProps = {
  className?: string;
};

// Compact, single-row product announcement bar: Google Cloud logo + inline
// message, brand CTA, dismissible via the shared CloseButton.
export const GoogleCloudAnnouncementBar = ({
  className,
}: GoogleCloudAnnouncementBarProps): ReactElement | null => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const { title, body, cta, ctaUrl } = googleCloudMessage;

  return (
    <div
      className={classNames(
        'relative flex w-full items-center gap-3 overflow-hidden rounded-12 px-3 py-2 tablet:px-4',
        className,
      )}
      style={{ background: gcpSurfaceBg, border: gcpHairline }}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-10 bg-background-default">
        <GoogleCloudLogo size={22} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col tablet:flex-row tablet:items-center tablet:gap-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Primary}
          bold
          className="whitespace-nowrap"
        >
          {title}
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="min-w-0 truncate"
        >
          {body}
        </Typography>
      </div>
      <GoogleCloudCta href={ctaUrl} className="!px-4 !py-1.5 typo-footnote">
        {cta}
      </GoogleCloudCta>
      <CloseButton
        size={ButtonSize.Small}
        className="shrink-0"
        onClick={() => setDismissed(true)}
      />
    </div>
  );
};

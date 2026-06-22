import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { GoogleCloudLogo } from './GoogleCloudLogo';
import { GoogleCloudCta } from './GoogleCloudCta';
import { googleCloudAd } from './content';
import { gcpCoverBg } from './brand';

type GoogleCloudHeadAdProps = {
  className?: string;
};

// The head ad slot, reskinned to Google Cloud. Visually faithful to the
// production `AdGrid` card (source row → title → cover → CTA + "Ad" label)
// but self-contained so it renders without the ad-fetch/rotation hooks.
export const GoogleCloudHeadAd = ({
  className,
}: GoogleCloudHeadAdProps): ReactElement => {
  const { company, description, cta, url } = googleCloudAd;

  return (
    <article
      className={classNames(
        'flex h-full min-h-card flex-col rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-0',
        className,
      )}
      data-testid="googleCloudHeadAd"
    >
      <div className="mx-4 mt-4 flex h-8 items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-default">
          <GoogleCloudLogo size={20} />
        </div>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Primary}
          bold
          className="min-w-0 flex-1 truncate"
        >
          {company}
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="rounded-6 border border-border-subtlest-tertiary px-1.5 py-0.5"
        >
          Ad
        </Typography>
      </div>
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
        className="mx-4 mt-3 line-clamp-3"
      >
        {description}
      </Typography>
      <div className="flex-1" />
      <div className="mx-4 mt-3">
        <div
          className="flex aspect-video w-full items-center justify-center rounded-12"
          style={{ background: gcpCoverBg }}
        >
          <div className="flex items-center gap-2 rounded-12 bg-background-default px-3 py-2">
            <GoogleCloudLogo size={24} />
            <span className="font-bold text-text-primary typo-callout">
              Google Cloud
            </span>
          </div>
        </div>
      </div>
      <div className="mx-4 mb-4 mt-3 flex items-center justify-between gap-2">
        <GoogleCloudCta href={url} className="!px-4 !py-2 typo-footnote">
          {cta}
        </GoogleCloudCta>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Ad · daily.dev
        </Typography>
      </div>
    </article>
  );
};

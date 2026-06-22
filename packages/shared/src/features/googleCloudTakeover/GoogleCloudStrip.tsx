import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { GoogleCloudLogo } from './GoogleCloudLogo';
import { GoogleCloudCta } from './GoogleCloudCta';
import { googleCloudMessage } from './content';
import { gcpStripBg } from './brand';

type GoogleCloudStripProps = {
  className?: string;
  style?: React.CSSProperties;
};

// In-feed strip, reskinned to Google Cloud. Matches the size, position, and
// structure of the production briefing strip (`BriefBanner`): a full-row,
// centered card with title → body → CTA. Reuses the shared announcement copy.
export const GoogleCloudStrip = ({
  className,
  style,
}: GoogleCloudStripProps): ReactElement => {
  const { title, body, cta, ctaUrl } = googleCloudMessage;

  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-4 rounded-16 px-4 py-6 text-center',
        className,
      )}
      style={{ background: gcpStripBg, ...style }}
    >
      <div className="flex size-12 items-center justify-center rounded-16 bg-background-default">
        <GoogleCloudLogo size={32} />
      </div>
      <div className="flex flex-col gap-1" style={{ color: '#ffffff' }}>
        <h3 className="font-bold typo-title3">{title}</h3>
        <p className="typo-callout">{body}</p>
      </div>
      <GoogleCloudCta href={ctaUrl} inverted>
        {cta}
      </GoogleCloudCta>
    </div>
  );
};

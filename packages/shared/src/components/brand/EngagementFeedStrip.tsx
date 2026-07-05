import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { EngagementAdCta } from './EngagementAdCta';
import type { ResolvedCreative } from '../../lib/engagementAds';
import { useEngagementPlacementLog } from '../../hooks/useEngagementPlacementLog';
import { Origin } from '../../lib/log';

type EngagementFeedStripProps = {
  creative: ResolvedCreative;
  className?: string;
  style?: CSSProperties;
};

// Full-row in-feed strip driven by an engagement creative that opted into the
// feed-strip placement. Mirrors the production briefing strip's size and
// structure (centered logo → title → body → CTA) and paints the campaign's
// brand gradient. Positioning on a clean grid row is handled by the feed's
// full-row insertion machinery (see useFeed / Feed).
export const EngagementFeedStrip = ({
  creative,
  className,
  style,
}: EngagementFeedStripProps): ReactElement => {
  const { name, body, cta, url, logo, primaryColor, secondaryColor } = creative;
  const { ref, onClick } = useEngagementPlacementLog({
    creative,
    origin: Origin.EngagementFeedStrip,
  });

  return (
    <div
      ref={ref}
      className={classNames(
        'flex flex-col items-center gap-4 rounded-16 px-4 py-6 text-center',
        className,
      )}
      style={{
        background: `linear-gradient(270deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
        ...style,
      }}
    >
      <div className="flex size-12 items-center justify-center rounded-16 bg-background-default">
        <img src={logo} alt={name} className="size-8 object-contain" />
      </div>
      <div className="flex flex-col gap-1 text-white">
        <h3 className="font-bold typo-title3">{name}</h3>
        <p className="typo-callout">{body}</p>
      </div>
      <EngagementAdCta
        href={url}
        brandColor={primaryColor}
        inverted
        onClick={onClick}
      >
        {cta}
      </EngagementAdCta>
    </div>
  );
};

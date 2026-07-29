import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Faithful mock-ups of how a shared link unfurls on each major platform.
 * These intentionally use raw inline styles (not the daily.dev design tokens)
 * because the goal is to reproduce the *third-party* chrome of X, LinkedIn,
 * Facebook, Slack, Discord and the messengers as closely as possible so the
 * team can review our Open Graph output in a realistic context.
 */

export type CardType = 'summary' | 'summary_large_image';

export interface OgData {
  /** Host shown in the preview, e.g. "app.daily.dev". */
  domain: string;
  /** og:url path, shown in the meta table only. */
  path?: string;
  /** og:title — the headline platforms display. */
  title: string;
  /** og:description. */
  description: string;
  /** og:image URL. Used when imageNode is not provided. */
  image?: string;
  /** Render a faithful mock of a dynamically generated image instead of <img>. */
  imageNode?: ReactNode;
  /** Square-ratio variant of the generated image, for summary cards. */
  squareNode?: ReactNode;
  /** twitter:card. */
  cardType: CardType;
  /** og:site_name. */
  siteName?: string;
  /** og:image:alt / twitter:image:alt. */
  imageAlt?: string;
  /** twitter:site handle, e.g. "@dailydotdev". */
  twitterSite?: string;
}

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const clamp = (lines: number): CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const Favicon = ({ size = 16 }: { size?: number }): React.ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: 4,
      background: '#0e1217',
      color: '#fff',
      fontSize: size * 0.6,
      fontWeight: 700,
      flexShrink: 0,
      fontFamily: SANS,
    }}
  >
    d.
  </span>
);

const ImageFrame = ({
  data,
  radius = 0,
  ratio = 1200 / 630,
}: {
  data: OgData;
  radius?: number;
  ratio?: number;
}): React.ReactElement => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      aspectRatio: `${ratio}`,
      overflow: 'hidden',
      borderRadius: radius,
      // Dark so a non-1.91:1 image letterboxes the way X/FB actually show it.
      background: '#0e1217',
      flexShrink: 0,
    }}
  >
    {data.imageNode ? (
      <div style={{ position: 'absolute', inset: 0 }}>{data.imageNode}</div>
    ) : (
      <img
        src={data.image}
        alt={data.imageAlt || ''}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          // contain → the WHOLE real image shows (the DevCard/squad banner are
          // not 1.91:1, so cover would crop them into something broken-looking).
          objectFit: 'contain',
        }}
      />
    )}
  </div>
);

const SquareThumb = ({
  data,
  size,
}: {
  data: OgData;
  size: number;
}): React.ReactElement => (
  <div
    style={{
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0,
      overflow: 'hidden',
      background: '#0e1217',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {data.squareNode ? (
      // A dedicated square-ratio design (logo + cover art + source, no title).
      <div style={{ position: 'absolute', inset: 0 }}>{data.squareNode}</div>
    ) : (
      // Fallback: keep the 1.91:1 design intact and letterbox it into the
      // square so the whole card still reads — rather than squishing it.
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1200 / 630',
        }}
      >
        {data.imageNode ? (
          <div style={{ position: 'absolute', inset: 0 }}>{data.imageNode}</div>
        ) : (
          <img
            src={data.image}
            alt={data.imageAlt || ''}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// X / Twitter
// ---------------------------------------------------------------------------
export const XCard = ({ data }: { data: OgData }): React.ReactElement => {
  if (data.cardType === 'summary') {
    return (
      <div
        style={{
          display: 'flex',
          maxWidth: 438,
          border: '1px solid #cfd9de',
          borderRadius: 16,
          overflow: 'hidden',
          fontFamily: SANS,
          background: '#fff',
        }}
      >
        <SquareThumb data={data} size={128} />
        <div style={{ padding: '8px 12px', minWidth: 0 }}>
          <div style={{ color: '#536471', fontSize: 15 }}>{data.domain}</div>
          <div style={{ color: '#0f1419', fontSize: 15, ...clamp(2) }}>
            {data.title}
          </div>
          <div style={{ color: '#536471', fontSize: 15, ...clamp(2) }}>
            {data.description}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        maxWidth: 504,
        border: '1px solid #cfd9de',
        borderRadius: 16,
        overflow: 'hidden',
        fontFamily: SANS,
        background: '#fff',
      }}
    >
      <ImageFrame data={data} />
      <span
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          background: 'rgba(0,0,0,0.77)',
          color: '#fff',
          fontSize: 13,
          padding: '1px 6px',
          borderRadius: 4,
        }}
      >
        {data.domain}
      </span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// LinkedIn
// ---------------------------------------------------------------------------
export const LinkedInCard = ({
  data,
}: {
  data: OgData;
}): React.ReactElement => (
  <div
    style={{
      maxWidth: 504,
      border: '1px solid #e0e0e0',
      borderRadius: 2,
      overflow: 'hidden',
      fontFamily: SANS,
      background: '#fff',
    }}
  >
    <ImageFrame data={data} />
    <div style={{ padding: '8px 12px' }}>
      <div
        style={{
          color: 'rgba(0,0,0,0.9)',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.3,
          ...clamp(2),
        }}
      >
        {data.title}
      </div>
      <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, marginTop: 2 }}>
        {data.domain}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Facebook
// ---------------------------------------------------------------------------
export const FacebookCard = ({
  data,
}: {
  data: OgData;
}): React.ReactElement => (
  <div
    style={{
      maxWidth: 504,
      border: '1px solid #dddfe2',
      borderRadius: 8,
      overflow: 'hidden',
      fontFamily: SANS,
      background: '#fff',
    }}
  >
    <ImageFrame data={data} />
    <div style={{ background: '#f2f3f5', padding: '10px 12px' }}>
      <div
        style={{
          color: '#606770',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.2,
        }}
      >
        {data.domain}
      </div>
      <div
        style={{
          color: '#1d2129',
          fontSize: 16,
          fontWeight: 600,
          lineHeight: 1.25,
          marginTop: 3,
          ...clamp(2),
        }}
      >
        {data.title}
      </div>
      <div
        style={{ color: '#606770', fontSize: 14, marginTop: 3, ...clamp(1) }}
      >
        {data.description}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Slack
// ---------------------------------------------------------------------------
export const SlackCard = ({ data }: { data: OgData }): React.ReactElement => (
  <div
    style={{
      maxWidth: 460,
      borderLeft: '4px solid #dddddd',
      borderRadius: 4,
      paddingLeft: 12,
      fontFamily: `Lato, ${SANS}`,
      background: '#fff',
    }}
  >
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}
    >
      <Favicon size={16} />
      <span style={{ color: '#1d1c1d', fontSize: 13, fontWeight: 700 }}>
        {data.siteName || 'daily.dev'}
      </span>
    </div>
    <div
      style={{
        color: '#1264a3',
        fontSize: 15,
        fontWeight: 700,
        lineHeight: 1.3,
        ...clamp(2),
      }}
    >
      {data.title}
    </div>
    <div
      style={{
        color: '#1d1c1d',
        fontSize: 15,
        lineHeight: 1.46,
        margin: '2px 0 8px',
        maxWidth: 380,
        ...clamp(3),
      }}
    >
      {data.description}
    </div>
    <div style={{ maxWidth: 360 }}>
      <ImageFrame data={data} radius={8} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Discord
// ---------------------------------------------------------------------------
export const DiscordCard = ({ data }: { data: OgData }): React.ReactElement => (
  <div
    style={{
      maxWidth: 432,
      background: '#2b2d31',
      borderRadius: 4,
      borderLeft: '4px solid #1e1f22',
      padding: '8px 16px 16px 12px',
      fontFamily: SANS,
    }}
  >
    <div style={{ color: '#dbdee1', fontSize: 12, margin: '8px 0 2px' }}>
      {data.siteName || 'daily.dev'}
    </div>
    <div
      style={{
        color: '#00a8fc',
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.3,
        ...clamp(2),
      }}
    >
      {data.title}
    </div>
    <div
      style={{
        color: '#dbdee1',
        fontSize: 14,
        lineHeight: 1.3,
        margin: '4px 0 8px',
        ...clamp(3),
      }}
    >
      {data.description}
    </div>
    <div style={{ maxWidth: 400 }}>
      <ImageFrame data={data} radius={4} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// WhatsApp (received bubble)
// ---------------------------------------------------------------------------
export const WhatsAppCard = ({
  data,
}: {
  data: OgData;
}): React.ReactElement => (
  <div
    style={{
      maxWidth: 330,
      background: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 1px 1px rgba(0,0,0,0.13)',
      fontFamily: SANS,
    }}
  >
    <ImageFrame data={data} />
    <div style={{ padding: '8px 10px' }}>
      <div style={{ color: '#111b21', fontSize: 14, ...clamp(2) }}>
        {data.title}
      </div>
      <div
        style={{ color: '#667781', fontSize: 13, marginTop: 2, ...clamp(2) }}
      >
        {data.description}
      </div>
      <div style={{ color: '#667781', fontSize: 13, marginTop: 2 }}>
        {data.domain}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// iMessage (received bubble)
// ---------------------------------------------------------------------------
export const IMessageCard = ({
  data,
}: {
  data: OgData;
}): React.ReactElement => (
  <div
    style={{
      maxWidth: 260,
      background: '#e9e9eb',
      borderRadius: 18,
      overflow: 'hidden',
      fontFamily: SANS,
    }}
  >
    <ImageFrame data={data} />
    <div style={{ padding: '8px 12px' }}>
      <div
        style={{
          color: '#000',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.3,
          ...clamp(2),
        }}
      >
        {data.title}
      </div>
      <div style={{ color: '#8e8e93', fontSize: 12, marginTop: 1 }}>
        {data.domain}
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Platform grid — renders one preview per platform for a given OgData.
// ---------------------------------------------------------------------------
const PLATFORMS: Array<{ label: string; Card: typeof XCard }> = [
  { label: 'X / Twitter', Card: XCard },
  { label: 'LinkedIn', Card: LinkedInCard },
  { label: 'Facebook', Card: FacebookCard },
  { label: 'Slack', Card: SlackCard },
  { label: 'Discord', Card: DiscordCard },
  { label: 'WhatsApp', Card: WhatsAppCard },
  { label: 'iMessage', Card: IMessageCard },
];

const platformLabelStyle: CSSProperties = {
  fontFamily: SANS,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: '#71717a',
  marginBottom: 8,
};

export const PlatformGrid = ({
  data,
}: {
  data: OgData;
}): React.ReactElement => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: 28,
      alignItems: 'start',
    }}
  >
    {PLATFORMS.map(({ label, Card }) => (
      <div key={label}>
        <div style={platformLabelStyle}>{label}</div>
        <Card data={data} />
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Meta-tag inspector table with per-platform length warnings.
// ---------------------------------------------------------------------------
const LIMITS = { title: 60, description: 110 };

const Row = ({
  tag,
  value,
  limit,
}: {
  tag: string;
  value?: string;
  limit?: number;
}): React.ReactElement => {
  const len = value?.length ?? 0;
  const over = limit ? len > limit : false;
  return (
    <tr style={{ borderBottom: '1px solid var(--theme-divider-tertiary)' }}>
      <td
        style={{
          padding: '6px 12px',
          fontFamily: 'monospace',
          fontSize: 12,
          whiteSpace: 'nowrap',
          verticalAlign: 'top',
          color: 'var(--theme-text-tertiary)',
        }}
      >
        {tag}
      </td>
      <td
        style={{
          padding: '6px 12px',
          fontSize: 13,
          color: 'var(--theme-text-primary)',
        }}
      >
        {value || <em style={{ opacity: 0.5 }}>—</em>}
      </td>
      <td
        style={{
          padding: '6px 12px',
          fontSize: 12,
          whiteSpace: 'nowrap',
          textAlign: 'right',
          color: over ? '#d4342c' : 'var(--theme-text-tertiary)',
          fontWeight: over ? 700 : 400,
        }}
      >
        {limit ? `${len} / ${limit}` : len || ''}
      </td>
    </tr>
  );
};

export const MetaTagsTable = ({
  data,
}: {
  data: OgData;
}): React.ReactElement => {
  const url = `https://${data.domain}${data.path || ''}`;
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'var(--theme-surface-float)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <tbody>
        <Row tag="og:title" value={data.title} limit={LIMITS.title} />
        <Row
          tag="og:description"
          value={data.description}
          limit={LIMITS.description}
        />
        <Row tag="og:image" value={data.image || '(generated)'} />
        <Row tag="og:image:alt" value={data.imageAlt} />
        <Row tag="og:url" value={url} />
        <Row tag="og:site_name" value={data.siteName} />
        <Row tag="twitter:card" value={data.cardType} />
        <Row tag="twitter:site" value={data.twitterSite} />
      </tbody>
    </table>
  );
};

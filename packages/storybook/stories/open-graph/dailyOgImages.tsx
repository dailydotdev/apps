import React from 'react';
import type { CSSProperties } from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { DocsIcon } from '@dailydotdev/shared/src/components/icons/Docs';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import {
  OgCover,
  Ambient,
  Logo,
  Title,
  Subtitle,
  MetaPill,
  Actions,
  StatBar,
  PrimaryButton,
  GlassBar,
  GRAD,
  CABBAGE,
  INK,
  SANS,
  TEXT,
  SECONDARY,
  TERTIARY,
  clamp,
  white,
  XD,
} from './cover';
import type { StatItem } from './cover';

// ===========================================================================
// RECOMMENDED — one unified, contextual system
// ===========================================================================

export type RecommendedKind =
  | 'article'
  | 'shared'
  | 'profile'
  | 'squad'
  | 'invite'
  | 'tag'
  | 'comment'
  | 'plus'
  | 'generic';

interface RecommendedProps {
  kind?: RecommendedKind;
  title?: string;
  subtitle?: string;
  cover?: string;
  name?: string;
  handle?: string;
  avatarSrc?: string;
  meta?: string;
  sharer?: string;
  upvotes?: string;
  comments?: string;
  // profile stats
  reputation?: string;
  streak?: string;
  posts?: string;
  reads?: string;
  tags?: string[];
  sources?: string[]; // favorite source logo URLs ("reads the most")
  // squad stats
  members?: string;
  // invite / referral / plus
  cta?: string; // white primary button label
  count?: string; // prominent count (number shows in cabbage)
  countWord?: string; // e.g. "developers"
  mascot?: string; // Charm illustration URL for the art slot
  square?: boolean; // render the square (1:1) summary-card variant
}

// Square (1:1) variant — responsive fallback for summary cards. The headline
// is dropped (unreadable at thumbnail size, and it's already in the link);
// keep only what reads: the cover art, the daily.dev logo, and the source.
const SquareCover = ({
  cover,
  source,
}: {
  cover?: string;
  source?: string;
}): React.ReactElement => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      containerType: 'inline-size',
      fontFamily: SANS,
      background: INK,
    }}
  >
    {cover ? (
      <Ambient src={cover} />
    ) : (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(60cqw 60cqw at 50% 0%, ${CABBAGE}33, transparent 60%)`,
        }}
      />
    )}
    {/* top bar: source (left) + logo (right) */}
    <div
      style={{
        position: 'absolute',
        top: '7cqw',
        left: '7cqw',
        right: '7cqw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '3cqw',
        zIndex: 2,
      }}
    >
      {source ? (
        <span
          style={{ display: 'inline-flex', alignItems: 'center', gap: '2cqw' }}
        >
          <span
            style={{
              width: '5cqw',
              height: '5cqw',
              borderRadius: '1.4cqw',
              background: '#FF8E3B',
              flexShrink: 0,
            }}
          />
          <span
            style={{ color: SECONDARY, fontSize: '3.6cqw', fontWeight: 500 }}
          >
            {source}
          </span>
        </span>
      ) : (
        <span />
      )}
      <Logo />
    </div>
    {/* centered cover art — the hero of the square */}
    {cover && (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <img
          src={cover}
          alt=""
          style={{
            width: '60%',
            aspectRatio: '1',
            objectFit: 'cover',
            borderRadius: '8cqw',
            border: '1px solid rgba(255,255,255,0.2)',
            boxSizing: 'border-box',
            boxShadow: '0 4cqw 11cqw rgba(0,0,0,0.55)',
          }}
        />
      </div>
    )}
  </div>
);

// ---- Layout A building blocks for the recommended template ----------------
const RArt = ({
  src,
  circle = false,
}: {
  src: string;
  circle?: boolean;
}): React.ReactElement => (
  <img
    src={src}
    alt=""
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: circle ? '50%' : '4.5cqw',
      border: '1px solid rgba(255,255,255,0.2)',
      boxSizing: 'border-box',
      boxShadow: '0 4cqw 11cqw rgba(0,0,0,0.55)',
    }}
  />
);
const RTile = ({
  children,
  circle = false,
}: {
  children: React.ReactNode;
  circle?: boolean;
}): React.ReactElement => (
  <div
    style={{
      width: '100%',
      height: '100%',
      borderRadius: circle ? '50%' : '4.5cqw',
      background: GRAD,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0 4cqw 11cqw rgba(0,0,0,0.5)',
    }}
  >
    {children}
  </div>
);
const RMark = (): React.ReactElement => (
  <span
    style={{ display: 'inline-flex', width: '56%', height: '32%', ...white }}
  >
    <LogoIcon className={{ container: 'h-full w-full' }} />
  </span>
);
const REyebrow = ({
  text,
  sub,
  src,
  dot = false,
}: {
  text: string;
  sub?: string;
  src?: string;
  dot?: boolean;
}): React.ReactElement => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.4cqw',
      minWidth: 0,
    }}
  >
    {src && (
      <img
        src={src}
        alt=""
        style={{
          width: '3.6cqw',
          height: '3.6cqw',
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )}
    {!src && dot && (
      <span
        style={{
          width: '3.4cqw',
          height: '3.4cqw',
          borderRadius: '1cqw',
          background: GRAD,
          flexShrink: 0,
        }}
      />
    )}
    <span
      style={{
        color: SECONDARY,
        fontSize: '2.3cqw',
        fontWeight: 500,
        ...clamp(1),
      }}
    >
      {text}
    </span>
    {sub && (
      <span style={{ color: TERTIARY, fontSize: '2.1cqw', flexShrink: 0 }}>
        · {sub}
      </span>
    )}
  </div>
);

// Charm mascot in the art slot.
// Charm mascot — bigger, anchored bottom-right and dropped a bit lower so it
// fills the corner instead of floating small. (The art slot is position:
// absolute, so this positions against it.)
const RMascot = ({ src }: { src: string }): React.ReactElement => (
  <img
    src={src}
    alt=""
    style={{
      position: 'absolute',
      right: '-2%',
      bottom: '-10%',
      width: '118%',
      height: '118%',
      maxWidth: 'none',
      objectFit: 'contain',
      // Anchor the dog to the bottom-right corner so it never reaches the
      // top-right logo or runs into the headline on the left.
      objectPosition: 'right bottom',
      filter: 'drop-shadow(0 3cqw 7cqw rgba(0,0,0,0.45))',
    }}
  />
);

// Prominent count line — the number pops in cabbage, with a leading icon.
const ProminentCount = ({
  count,
  word,
}: {
  count: string;
  word?: string;
}): React.ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1.4cqw',
      color: SECONDARY,
      fontSize: '3.2cqw',
      fontWeight: 600,
    }}
  >
    <span
      style={{
        display: 'inline-flex',
        width: '3.2cqw',
        height: '3.2cqw',
        color: CABBAGE,
      }}
    >
      <UserIcon secondary style={{ width: '100%', height: '100%' }} />
    </span>
    <span>
      <span style={{ color: CABBAGE, fontWeight: 800 }}>{count}</span>
      {word ? ` ${word}` : ''}
    </span>
  </span>
);

// Community proof — a stack of real member avatars + the count, the way the
// squad/source pages surface the community. Used for source + tag. Faces are
// real daily.dev developer avatars.
const COMMUNITY_FACES = [
  'https://media.daily.dev/image/upload/s--FcI3RdS1--/f_auto/v1745335145/avatars/avatar_R9RafYjp15h3mJ9XdIkhy',
  'https://media.daily.dev/image/upload/s--AVEMGQgE--/f_auto/v1744349812/avatars/avatar_RVvUzGofSIHGyTxdjqDN1',
  'https://media.daily.dev/image/upload/s--CwdXky60--/f_auto/v1733031652/avatars/avatar_rmFJzNXUNPh163VaQkmF0',
];
const Community = ({ count }: { count: string }): React.ReactElement => (
  <GlassBar>
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: '1.8cqw' }}
    >
      <span style={{ display: 'flex' }}>
        {COMMUNITY_FACES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            style={{
              width: '3.8cqw',
              height: '3.8cqw',
              borderRadius: '50%',
              objectFit: 'cover',
              marginLeft: i === 0 ? 0 : '-1.2cqw',
              boxShadow: '0 0 0 0.45cqw rgba(11,14,19,0.95)',
            }}
          />
        ))}
      </span>
      <span style={{ color: SECONDARY, fontSize: '2.5cqw', fontWeight: 600 }}>
        {count}
      </span>
    </span>
  </GlassBar>
);

// ---- Developer profile — mirrors the real DevCard ------------------------
// Rounded avatar with a clean 1px hairline border (subtle, low-opacity white —
// a soft edge rather than a heavy band).
const TiltAvatar = ({
  label,
  src,
}: {
  label?: string;
  src?: string;
}): React.ReactElement => {
  const base: CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '8cqw',
    border: '1px solid rgba(255,255,255,0.2)',
    boxSizing: 'border-box',
    boxShadow: '0 4cqw 11cqw rgba(0,0,0,0.5)',
  };
  return src ? (
    <img src={src} alt="" style={{ ...base, objectFit: 'cover' }} />
  ) : (
    <div
      style={{
        ...base,
        background: GRAD,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: '#fff', fontSize: '15cqw', fontWeight: 800 }}>
        {label}
      </span>
    </div>
  );
};

// The DevCard stats bar: 3 sections, each icon + number + label.
const ProfileStatSection = ({
  value,
  label,
}: {
  value: string;
  label: string;
}): React.ReactElement => (
  <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
    <span
      style={{
        color: TEXT,
        fontSize: '2.6cqw',
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </span>
    <span style={{ color: TERTIARY, fontSize: '1.5cqw', fontWeight: 500 }}>
      {label}
    </span>
  </span>
);
const ProfileStats = ({
  reputation,
  streak,
  reads,
}: {
  reputation?: string;
  streak?: string;
  reads?: string;
}): React.ReactElement => {
  const divider = (
    <span
      style={{
        width: '0.15cqw',
        height: '4.2cqw',
        background: 'rgba(255,255,255,0.16)',
      }}
    />
  );
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2cqw',
        padding: '1.8cqw 2.6cqw',
        borderRadius: '2.4cqw',
        // Same glass background as the tag chips / engagement bar.
        background: 'rgba(255,255,255,0.1)',
        border: '0.12cqw solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: 'inset 0 0.15cqw 0 rgba(255,255,255,0.12)',
      }}
    >
      {reputation && (
        <ProfileStatSection value={reputation} label="Reputation" />
      )}
      {reputation && streak && divider}
      {streak && <ProfileStatSection value={streak} label="Longest streak" />}
      {streak && reads && divider}
      {reads && <ProfileStatSection value={reads} label="Posts read" />}
    </div>
  );
};

const TagChips = ({ tags }: { tags: string[] }): React.ReactElement => (
  <span style={{ display: 'inline-flex', gap: '1.4cqw', flexWrap: 'wrap' }}>
    {tags.map((t) => (
      <span
        key={t}
        style={{
          padding: '0.5cqw 1.4cqw',
          borderRadius: '99cqw',
          background: 'rgba(255,255,255,0.1)',
          border: '0.12cqw solid rgba(255,255,255,0.2)',
          color: SECONDARY,
          fontSize: '1.5cqw',
          fontWeight: 600,
        }}
      >
        #{t}
      </span>
    ))}
  </span>
);

// Favorite sources the developer reads most — a "Reads" label + source logos
// (rounded squares on white), like the DevCard footer.
const SourceLogos = ({ logos }: { logos: string[] }): React.ReactElement => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1.4cqw' }}>
    <span style={{ color: TERTIARY, fontSize: '1.9cqw', fontWeight: 600 }}>
      Reads from
    </span>
    <span style={{ display: 'flex', gap: '0.9cqw' }}>
      {logos.map((l) => (
        <span
          key={l}
          style={{
            width: '3.6cqw',
            height: '3.6cqw',
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 0 0 0.3cqw rgba(11,14,19,0.85)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img
            src={l}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </span>
      ))}
    </span>
  </span>
);

/**
 * The recommended template = the locked "Layout A — clean" cover, one system
 * for every share type. Article/shared/comment keep the real engagement bar
 * (avocado upvote + comment); other types show stats, a meta pill, or a CTA.
 */
export const RecommendedOg = ({
  kind = 'article',
  title = 'How to build a dynamic Open Graph image pipeline at the edge',
  subtitle,
  cover,
  name,
  handle,
  avatarSrc,
  meta,
  sharer,
  upvotes = '312',
  comments = '448',
  reputation,
  streak,
  posts,
  reads,
  tags,
  sources,
  members,
  cta,
  count,
  countWord,
  mascot,
  square = false,
}: RecommendedProps): React.ReactElement => {
  if (square) {
    return <SquareCover cover={cover} source={name} />;
  }
  const engagement = <Actions d={{ ...XD, upvotes, comments }} />;
  const pill = meta ? <MetaPill text={meta} /> : undefined;
  const sub = subtitle ? <Subtitle>{subtitle}</Subtitle> : undefined;
  const ctaNode = cta ? <PrimaryButton>{cta}</PrimaryButton> : undefined;

  const squadStats: StatItem[] = [];
  if (members) {
    squadStats.push({ label: 'members', Cmp: SquadIcon, value: members });
  }
  if (posts) {
    squadStats.push({ label: 'posts', Cmp: DocsIcon, value: posts });
  }
  if (upvotes) {
    squadStats.push({ label: 'upvotes', Cmp: UpvoteIcon, value: upvotes });
  }

  switch (kind) {
    case 'shared':
      return (
        <OgCover
          fill
          backdrop={cover}
          eyebrow={
            <REyebrow text={`${sharer} shared this`} src={avatarSrc} dot />
          }
          title={<Title>{title}</Title>}
          subtitle={name ? <Subtitle>{name}</Subtitle> : undefined}
          meta={engagement}
          art={cover ? <RArt src={cover} /> : undefined}
        />
      );
    case 'comment':
      // No art tile — the quote gets the full width.
      return (
        <OgCover
          fill
          eyebrow={
            <REyebrow
              text={name ?? 'Discussion'}
              sub="commented"
              src={avatarSrc}
              dot
            />
          }
          title={<Title size={5}>{title}</Title>}
          subtitle={meta ? <Subtitle>{meta}</Subtitle> : undefined}
          meta={engagement}
        />
      );
    case 'profile':
      // One ordered column with equal gaps: name/role → stats → tags → sources.
      return (
        <OgCover
          fill
          backdrop={cover}
          contentTop="12cqw"
          eyebrow={<REyebrow text={handle ? `@${handle}` : 'Developer'} />}
          title={
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2.6cqw',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1cqw',
                }}
              >
                <Title size={5.4} lines={1}>
                  {title}
                </Title>
                {subtitle && <Subtitle>{subtitle}</Subtitle>}
              </span>
              {(reputation || streak || reads) && (
                <span style={{ display: 'flex' }}>
                  <ProfileStats
                    reputation={reputation}
                    streak={streak}
                    reads={reads}
                  />
                </span>
              )}
              {sources?.length ? <SourceLogos logos={sources} /> : null}
              {tags?.length ? <TagChips tags={tags} /> : null}
            </span>
          }
          art={<TiltAvatar label={name?.[0]} src={avatarSrc} />}
        />
      );
    case 'squad':
      return (
        <OgCover
          fill
          eyebrow={<REyebrow text="Squad" />}
          title={<Title size={6}>{title}</Title>}
          subtitle={sub}
          meta={squadStats.length ? <StatBar stats={squadStats} /> : pill}
          art={
            cover ? (
              <RArt src={cover} circle />
            ) : (
              <RTile>
                <span
                  style={{ color: '#fff', fontSize: '15cqw', fontWeight: 800 }}
                >
                  {(title ?? 'S')[0]}
                </span>
              </RTile>
            )
          }
        />
      );
    case 'tag':
      return (
        <OgCover
          fill
          eyebrow={<REyebrow text="Topic" />}
          title={<Title size={6.4}>{title}</Title>}
          subtitle={sub}
          meta={ctaNode ?? (meta ? <Community count={meta} /> : undefined)}
          art={
            mascot ? (
              <RMascot src={mascot} />
            ) : (
              <RTile>
                <span
                  style={{ color: '#fff', fontSize: '18cqw', fontWeight: 800 }}
                >
                  #
                </span>
              </RTile>
            )
          }
        />
      );
    case 'invite':
      return (
        <OgCover
          fill
          eyebrow={
            <REyebrow text={`${sharer} invited you`} src={avatarSrc} dot />
          }
          title={<Title size={5.6}>{title}</Title>}
          subtitle={
            count ? <ProminentCount count={count} word={countWord} /> : sub
          }
          meta={ctaNode ?? pill}
          art={
            mascot ? (
              <RMascot src={mascot} />
            ) : cover ? (
              <RArt src={cover} circle />
            ) : (
              <RTile>
                <RMark />
              </RTile>
            )
          }
        />
      );
    case 'plus':
      return (
        <OgCover
          fill
          eyebrow={
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1.4cqw',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  width: '4.2cqw',
                  height: '4.2cqw',
                  color: CABBAGE,
                }}
              >
                <DevPlusIcon
                  secondary
                  style={{ width: '100%', height: '100%' }}
                />
              </span>
              <span
                style={{
                  color: SECONDARY,
                  fontSize: '2.3cqw',
                  fontWeight: 600,
                }}
              >
                daily.dev Plus
              </span>
            </span>
          }
          title={<Title size={5.6}>{title}</Title>}
          subtitle={sub}
          meta={ctaNode ?? (meta ? <Community count={meta} /> : undefined)}
          art={
            mascot ? (
              <RMascot src={mascot} />
            ) : (
              <RTile>
                <span style={{ display: 'inline-flex', width: '34%', ...white }}>
                  <DevPlusIcon
                    secondary
                    style={{ width: '100%', height: '100%' }}
                  />
                </span>
              </RTile>
            )
          }
        />
      );
    case 'generic':
      return (
        <OgCover
          fill
          eyebrow={<REyebrow text="daily.dev" />}
          title={<Title size={5.6}>{title}</Title>}
          subtitle={sub}
          meta={ctaNode ?? (meta ? <Community count={meta} /> : undefined)}
          art={
            mascot ? (
              <RMascot src={mascot} />
            ) : cover ? (
              <RArt src={cover} circle />
            ) : (
              <RTile>
                <RMark />
              </RTile>
            )
          }
        />
      );
    default:
      return (
        <OgCover
          fill
          backdrop={cover}
          eyebrow={<REyebrow text={name ?? 'daily.dev'} src={avatarSrc} dot />}
          title={<Title>{title}</Title>}
          meta={engagement}
          art={cover ? <RArt src={cover} /> : undefined}
        />
      );
  }
};

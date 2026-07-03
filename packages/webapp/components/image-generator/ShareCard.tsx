import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { DocsIcon } from '@dailydotdev/shared/src/components/icons/Docs';
import { UserIcon } from '@dailydotdev/shared/src/components/icons/User';
import DevPlusLogo from '@dailydotdev/shared/src/components/icons/DevPlus/filled.svg';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  cloudinaryCharmEmptySquads,
  cloudinaryCharmNotEnoughTags,
} from '@dailydotdev/shared/src/lib/image';

// Compact count: 1234 -> "1.2K", 1200000 -> "1.2M".
const fmt = (n?: number): string => {
  if (!n) {
    return '0';
  }
  if (n < 1000) {
    return `${n}`;
  }
  if (n < 1_000_000) {
    return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, '')}K`;
  }
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
};

/**
 * "Layout A" share-card design system, rendered as real DOM (screenshotted at
 * 1200×630 by the daily-api `/og` route via the scraper). Because this renders
 * in a real browser — not Satori — `line-clamp`, `backdrop-blur`, the real
 * fonts and the daily.dev design tokens all work natively; no truncation or
 * font-metric workarounds needed.
 *
 * The page wraps the chosen card in `#screenshot_wrapper` sized to exactly
 * 1200×630; each card fills that frame.
 */

export interface Identity {
  name: string;
  image?: string;
  meta?: string; // trailing context, e.g. "6m read"
  label?: string; // verb after the name, e.g. "invited you" / "shared"
  // Show an avatar slot: an image, or an initial fallback when `fallback` is
  // set. Label-only eyebrows ("Squad", "daily.dev", "Topic") set neither, so
  // no avatar/logo renders before the text.
  fallback?: boolean;
}

const Wordmark = (): ReactElement => (
  <span className="flex shrink-0 items-center gap-3 text-white">
    <LogoIcon className={{ container: 'h-8 w-auto' }} />
    <LogoText className={{ container: 'h-8 w-auto' }} />
  </span>
);

const Backdrop = ({ cover }: { cover?: string }): ReactElement => (
  <div className="absolute inset-0">
    {cover ? (
      <>
        <img
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-[48px]"
        />
        <div className="from-background-default/70 via-background-default/88 absolute inset-0 bg-gradient-to-b to-background-default" />
      </>
    ) : (
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(660px 660px at 100% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 19%, transparent), transparent 62%), radial-gradient(660px 660px at 0% 100%, color-mix(in srgb, var(--theme-accent-onion-default) 15%, transparent), transparent 62%)',
        }}
      />
    )}
  </div>
);

const IdentityAvatar = ({
  identity,
  shape,
}: {
  identity: Identity;
  shape: string;
}): ReactElement | null => {
  if (identity.image) {
    return (
      <img src={identity.image} alt="" className={`${shape} object-cover`} />
    );
  }
  // Person with no avatar: the initial on the brand gradient. Label-only
  // eyebrows (Squad / daily.dev / Topic) opt out entirely.
  if (identity.fallback) {
    return (
      <span
        className={`${shape} flex items-center justify-center bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default text-xl font-bold text-white`}
      >
        {identity.name?.charAt(0)?.toUpperCase() || ''}
      </span>
    );
  }
  return null;
};

const IdentityRow = ({ identity }: { identity: Identity }): ReactElement => {
  // Compact eyebrow matching the storybook REyebrow (~44px avatar, 28px text).
  const avatarShape =
    'h-11 w-11 shrink-0 rounded-full border border-[rgba(255,255,255,0.2)]';
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <IdentityAvatar identity={identity} shape={avatarShape} />
      <span className="flex items-baseline gap-2 truncate text-[28px] text-text-secondary">
        <strong className="font-bold text-text-primary">{identity.name}</strong>
        {!!identity.label && <span>{identity.label}</span>}
        {!!identity.meta && <span>· {identity.meta}</span>}
      </span>
    </div>
  );
};

const Title = ({
  children,
  className = 'text-[60px]',
  lines = 'line-clamp-3',
}: {
  children: ReactNode;
  className?: string;
  lines?: string;
}): ReactElement => (
  <span
    className={`font-bold leading-[1.1] tracking-tight text-text-primary ${className} ${lines}`}
  >
    {children}
  </span>
);

const Subtitle = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="mt-4 line-clamp-2 text-3xl leading-snug text-text-tertiary">
    {children}
  </span>
);

const GlassBar = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex items-center rounded-24 border-2 border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.1)] px-8 py-5 backdrop-blur-md">
    {children}
  </div>
);

const EngagementBar = ({
  upvotes,
  comments,
}: {
  upvotes: number;
  comments: number;
}): ReactElement => (
  <GlassBar>
    <span className="flex items-center gap-3">
      <UpvoteIcon
        size={IconSize.XLarge}
        className="text-accent-avocado-default"
      />
      <span className="text-3xl font-bold text-text-primary">{upvotes}</span>
    </span>
    <span className="mx-7 h-9 w-0.5 bg-[rgba(255,255,255,0.16)]" />
    <span className="flex items-center gap-3">
      <DiscussIcon size={IconSize.XLarge} className="text-text-primary" />
      <span className="text-3xl font-bold text-text-primary">{comments}</span>
    </span>
  </GlassBar>
);

const MetaPill = ({ text }: { text: string }): ReactElement => (
  <GlassBar>
    <span className="text-2xl font-semibold text-text-secondary">{text}</span>
  </GlassBar>
);

interface Stat {
  id: string;
  icon: ReactNode;
  value: string;
}

// Glass bar of icon+number stats (squad members / posts / upvotes).
const StatBar = ({ stats }: { stats: Stat[] }): ReactElement => (
  <GlassBar>
    <span className="flex items-center">
      {stats.map((s, i) => (
        <React.Fragment key={s.id}>
          {i > 0 && (
            <span className="mx-7 h-9 w-0.5 bg-[rgba(255,255,255,0.16)]" />
          )}
          <span className="flex items-center gap-3 text-text-primary">
            {s.icon}
            <span className="text-3xl font-bold">{s.value}</span>
          </span>
        </React.Fragment>
      ))}
    </span>
  </GlassBar>
);

// Community proof — a pile of member avatars + the count (squads / sources).
const CommunityBar = ({
  faces,
  count,
}: {
  faces: string[];
  count: string;
}): ReactElement => (
  <GlassBar>
    <span className="flex items-center gap-4">
      <span className="flex">
        {faces.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`h-11 w-11 rounded-full object-cover ring-4 ring-background-default ${
              i > 0 ? '-ml-3' : ''
            }`}
          />
        ))}
      </span>
      <span className="text-2xl font-semibold text-text-secondary">
        {count}
      </span>
    </span>
  </GlassBar>
);

// Prominent member count for invite cards: a user icon + the number in the
// brand cabbage colour + a word ("developers"), e.g. "26,606 developers".
const ProminentCount = ({
  count,
  word,
}: {
  count: string;
  word?: string;
}): ReactElement => (
  <span className="mt-4 flex items-center gap-2 text-[38px] font-semibold text-text-secondary">
    <UserIcon
      size={IconSize.Large}
      secondary
      className="text-accent-cabbage-default"
    />
    <span>
      <span className="font-extrabold text-accent-cabbage-default">
        {count}
      </span>
      {word ? ` ${word}` : ''}
    </span>
  </span>
);

const PrimaryButton = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="shadow-2xl flex items-center rounded-24 bg-white px-11 py-5 text-3xl font-bold text-background-default">
    {children}
  </span>
);

const Tile = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="shadow-2xl flex h-full w-full items-center justify-center rounded-[56px] bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default">
    {children}
  </div>
);

const ImageArt = ({
  src,
  circle,
}: {
  src: string;
  circle?: boolean;
}): ReactElement => (
  <img
    src={src}
    alt=""
    className={`shadow-2xl h-full w-full border border-[rgba(255,255,255,0.2)] object-cover ${
      circle ? 'rounded-full' : 'rounded-[56px]'
    }`}
  />
);

// Charm mascot (the dog) anchored into the bottom-right corner — overflows the
// art slot a touch; the frame's overflow-hidden clips it at the canvas edge.
const Mascot = ({ src }: { src: string }): ReactElement => (
  <img
    src={src}
    alt=""
    className="absolute -bottom-[10%] -right-[2%] h-[118%] w-[118%] max-w-none object-contain drop-shadow-2xl [object-position:right_bottom]"
  />
);

interface OgFrameProps {
  backdrop?: string;
  identity: Identity;
  children: ReactNode; // content column (title + subtitle, or richer)
  meta?: ReactNode; // bottom-left slot
  art?: ReactNode; // bottom-right slot
}

const OgFrame = ({
  backdrop,
  identity,
  children,
  meta,
  art,
}: OgFrameProps): ReactElement => (
  <div className="relative flex h-full w-full overflow-hidden bg-background-default text-text-primary">
    <Backdrop cover={backdrop} />

    {/* top bar */}
    <div className="absolute inset-x-16 top-16 flex items-center justify-between">
      <IdentityRow identity={identity} />
      <Wordmark />
    </div>

    {/* content column, vertically centred between top bar and meta/bottom */}
    <div
      className={`absolute left-16 top-[150px] flex flex-col justify-center ${
        art ? 'right-[464px]' : 'right-[140px]'
      } ${meta ? 'bottom-[168px]' : 'bottom-16'}`}
    >
      {children}
    </div>

    {/* meta slot */}
    {!!meta && <div className="absolute bottom-14 left-16 flex">{meta}</div>}

    {/* art slot */}
    {!!art && (
      <div className="absolute bottom-16 right-16 h-[360px] w-[360px]">
        {art}
      </div>
    )}
  </div>
);

// ---- per-type cards -------------------------------------------------------

export interface PostCardData {
  title?: string;
  summary?: string;
  image?: string;
  numUpvotes?: number;
  numComments?: number;
  readTime?: number;
  source?: { name?: string; image?: string; type?: string };
  author?: { name?: string; username?: string; image?: string };
  sharer?: { name?: string; image?: string };
}

export const PostShareCard = ({
  data,
}: {
  data: PostCardData;
}): ReactElement => {
  const isUserSource = data.source?.type === 'user';
  const identity: Identity = data.sharer
    ? {
        name: data.sharer.name ?? '',
        image: data.sharer.image,
        fallback: true,
        label: 'shared this',
      }
    : {
        name: (isUserSource ? data.author?.name : data.source?.name) ?? '',
        image: isUserSource ? data.author?.image : data.source?.image,
        fallback: true,
        meta: data.readTime ? `${data.readTime}m read` : undefined,
      };
  // On a shared card the source name gives identity context; a regular article
  // shows no subtitle — a 2-line clamped summary reads as noise, so we let the
  // title use the full content column instead.
  const subtitle = data.sharer ? data.source?.name : undefined;
  return (
    <OgFrame
      backdrop={data.image}
      identity={identity}
      art={data.image ? <ImageArt src={data.image} /> : undefined}
      meta={
        <EngagementBar
          upvotes={data.numUpvotes ?? 0}
          comments={data.numComments ?? 0}
        />
      }
    >
      <Title lines={subtitle ? 'line-clamp-4' : 'line-clamp-5'}>
        {data.title}
      </Title>
      {!!subtitle && <Subtitle>{subtitle}</Subtitle>}
    </OgFrame>
  );
};

export interface CommentCardData {
  content: string;
  numUpvotes?: number;
  replies?: number; // replies to THIS comment (children), not the post total
  author: { name: string; image?: string };
  postTitle?: string;
}

export const CommentShareCard = ({
  data,
}: {
  data: CommentCardData;
}): ReactElement => (
  <OgFrame
    identity={{
      name: data.author.name,
      image: data.author.image,
      fallback: true,
      label: 'commented',
    }}
    meta={
      <EngagementBar
        upvotes={data.numUpvotes ?? 0}
        comments={data.replies ?? 0}
      />
    }
  >
    <Title className="text-5xl">{`“${data.content}”`}</Title>
    {!!data.postTitle && <Subtitle>{`on “${data.postTitle}”`}</Subtitle>}
  </OgFrame>
);

export interface SourceCardData {
  name: string;
  image?: string;
  description?: string;
  followers?: number;
  faces?: string[]; // member/follower avatars for the community pile
}

export const SourceShareCard = ({
  data,
}: {
  data: SourceCardData;
}): ReactElement => {
  // Community proof (the storybook Community pattern): member faces + count.
  const count = data.followers
    ? `Followed by ${fmt(data.followers)} developers`
    : undefined;
  let meta: ReactNode;
  if (data.faces?.length) {
    meta = <CommunityBar faces={data.faces} count={count ?? ''} />;
  } else if (count) {
    meta = <MetaPill text={count} />;
  }
  return (
    <OgFrame
      identity={{ name: 'daily.dev' }}
      art={data.image ? <ImageArt src={data.image} circle /> : undefined}
      meta={meta}
    >
      <Title className="text-[64px]" lines="line-clamp-2">
        {data.name}
      </Title>
      {!!data.description && <Subtitle>{data.description}</Subtitle>}
    </OgFrame>
  );
};

export interface SquadCardData {
  name: string;
  image?: string;
  description?: string;
  members?: number;
  posts?: number;
  upvotes?: number;
  sharer?: { name?: string; image?: string }; // optional referrer (?userid)
}

export const SquadShareCard = ({
  data,
}: {
  data: SquadCardData;
}): ReactElement => {
  // Matches the storybook squad card: a Members / Posts / Upvotes stat bar.
  const stats: Stat[] = [];
  if (data.members) {
    stats.push({
      id: 'members',
      icon: <SquadIcon size={IconSize.Large} secondary />,
      value: fmt(data.members),
    });
  }
  if (data.posts) {
    stats.push({
      id: 'posts',
      icon: <DocsIcon size={IconSize.Large} secondary />,
      value: fmt(data.posts),
    });
  }
  if (data.upvotes) {
    stats.push({
      id: 'upvotes',
      icon: <UpvoteIcon size={IconSize.Large} secondary />,
      value: fmt(data.upvotes),
    });
  }
  const art = data.image ? (
    <ImageArt src={data.image} circle />
  ) : (
    <Tile>
      <span className="text-[120px] font-bold text-white">
        {data.name?.[0]}
      </span>
    </Tile>
  );

  // Shared via a referral (?userid) → the invite treatment (storybook):
  // "{inviter} invited you", "Join {squad}", a prominent member count, and a
  // "Tap to join" CTA. Otherwise the plain squad card with its stat bar.
  if (data.sharer) {
    return (
      <OgFrame
        identity={{
          name: data.sharer.name ?? 'Squad',
          image: data.sharer.image,
          fallback: true,
          label: 'invited you',
        }}
        art={art}
        meta={<PrimaryButton>Tap to join</PrimaryButton>}
      >
        <Title className="text-[62px]" lines="line-clamp-2">
          {`Join ${data.name}`}
        </Title>
        {!!data.members && (
          <ProminentCount
            count={data.members.toLocaleString()}
            word="developers"
          />
        )}
      </OgFrame>
    );
  }

  return (
    <OgFrame
      identity={{ name: 'Squad' }}
      art={art}
      meta={stats.length > 0 ? <StatBar stats={stats} /> : undefined}
    >
      <Title className="text-[62px]" lines="line-clamp-2">
        {data.name}
      </Title>
      {!!data.description && <Subtitle>{data.description}</Subtitle>}
    </OgFrame>
  );
};

// ---- profile card (distinct from the DevCard) -----------------------------
export interface ProfileCardData {
  name: string;
  handle?: string;
  image?: string;
  bio?: string;
  reputation?: number;
  streak?: number;
  reads?: number;
  tags?: string[];
  sources?: string[]; // most-read source logos
}

const ProfileStats = ({
  stats,
}: {
  stats: Array<{ value: string; label: string }>;
}): ReactElement => (
  <GlassBar>
    <span className="flex items-center">
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && (
            <span className="mx-7 h-[50px] w-0.5 bg-[rgba(255,255,255,0.16)]" />
          )}
          <span className="flex flex-col leading-tight">
            <span className="text-[31px] font-extrabold tabular-nums text-text-primary">
              {s.value}
            </span>
            <span className="text-lg font-medium text-text-secondary">
              {s.label}
            </span>
          </span>
        </React.Fragment>
      ))}
    </span>
  </GlassBar>
);

const SourceLogos = ({ logos }: { logos: string[] }): ReactElement => (
  <span className="flex items-center gap-4">
    <span className="text-[23px] font-semibold text-text-secondary">
      Reads from
    </span>
    <span className="flex gap-3">
      {logos.map((src) => (
        <span
          key={src}
          className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white"
        >
          <img src={src} alt="" className="h-11 w-11 object-cover" />
        </span>
      ))}
    </span>
  </span>
);

const ProfileTagChips = ({ tags }: { tags: string[] }): ReactElement => (
  <span className="flex flex-wrap">
    {tags.map((t) => (
      <span
        key={t}
        className="mb-3 mr-3 flex items-center justify-center rounded-max border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] px-[18px] py-2 text-lg font-semibold leading-none text-text-secondary"
      >
        #{t}
      </span>
    ))}
  </span>
);

export const ProfileShareCard = ({
  data,
}: {
  data: ProfileCardData;
}): ReactElement => {
  const stats: Array<{ value: string; label: string }> = [];
  if (data.reputation) {
    stats.push({ value: fmt(data.reputation), label: 'Reputation' });
  }
  if (data.streak) {
    stats.push({ value: fmt(data.streak), label: 'Longest streak' });
  }
  if (data.reads) {
    stats.push({ value: fmt(data.reads), label: 'Posts read' });
  }
  return (
    <OgFrame
      backdrop={data.image}
      identity={{ name: data.handle ? `@${data.handle}` : 'Developer' }}
      art={data.image ? <ImageArt src={data.image} /> : undefined}
    >
      <div className="flex flex-col">
        <Title className="text-[64px]" lines="line-clamp-1">
          {data.name}
        </Title>
        {!!data.bio && <Subtitle>{data.bio}</Subtitle>}
        {stats.length > 0 && (
          <div className="mt-7 flex">
            <ProfileStats stats={stats} />
          </div>
        )}
        {!!data.sources?.length && (
          <div className="mt-6 flex">
            <SourceLogos logos={data.sources} />
          </div>
        )}
        {!!data.tags?.length && (
          <div className="mt-6 flex">
            <ProfileTagChips tags={data.tags} />
          </div>
        )}
      </div>
    </OgFrame>
  );
};

export const TagShareCard = ({ tag }: { tag: string }): ReactElement => (
  <OgFrame
    identity={{ name: 'Topic' }}
    art={<Mascot src={cloudinaryCharmNotEnoughTags} />}
    meta={<PrimaryButton>{`Explore #${tag}`}</PrimaryButton>}
  >
    <Title className="text-[72px]" lines="line-clamp-2">{`#${tag}`}</Title>
    <Subtitle>
      Follow this topic to fill your feed with the best posts about it.
    </Subtitle>
  </OgFrame>
);

export const InviteShareCard = ({
  name,
  image,
}: {
  name: string;
  image?: string;
}): ReactElement => (
  <OgFrame
    identity={{ name, image, fallback: true, label: 'invited you' }}
    art={<Mascot src={cloudinaryCharmEmptySquads} />}
    meta={<PrimaryButton>Tap to join</PrimaryButton>}
  >
    <Title className="text-[68px]">Join me on daily.dev</Title>
    <Subtitle>The one feed developers actually read</Subtitle>
  </OgFrame>
);

export const PlusShareCard = (): ReactElement => (
  <OgFrame
    identity={{ name: 'daily.dev Plus' }}
    art={
      <Tile>
        <DevPlusLogo className="h-[220px] w-[220px] text-white" />
      </Tile>
    }
    meta={<PrimaryButton>Upgrade to Plus</PrimaryButton>}
  >
    <Title className="text-[58px]">Supercharge your daily.dev</Title>
    <Subtitle>
      Plus unlocks advanced AI, custom feeds, and a clutter-free, ad-free
      experience.
    </Subtitle>
  </OgFrame>
);

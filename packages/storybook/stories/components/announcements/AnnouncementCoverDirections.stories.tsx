import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  MegaphoneIcon,
  MiniCloseIcon,
  MoveToIcon,
  PlayIcon,
  SparkleIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  cloudinaryFeedFiltersScrollDark,
  cloudinaryFeedFiltersYourFeedDark,
  cloudinaryNotificationsBig,
  cloudinarySquadsDirectoryCardBannerDefault,
  cloudinarySquadsPromotionBanner,
  cloudinarySquadsTourBanner2,
} from '@dailydotdev/shared/src/lib/image';

// One sample announcement reused across every direction so they're comparable.
const S = {
  badge: 'New',
  title: 'Introducing Clips',
  desc: 'Save the best moments from any post and share them in one tap.',
  cta: 'Try Clips',
};

const IMG = {
  banner: cloudinarySquadsDirectoryCardBannerDefault,
  feed: cloudinaryFeedFiltersYourFeedDark,
  scroll: cloudinaryFeedFiltersScrollDark,
  notif: cloudinaryNotificationsBig,
  tour: cloudinarySquadsTourBanner2,
  promo: cloudinarySquadsPromotionBanner,
};

// Card frame: relative + clip so every image and scrim respects the radius.
const CARD =
  'relative w-full overflow-hidden rounded-16 border border-border-subtlest-quaternary';
const SURFACE = 'bg-background-subtle';

const cover = (src: string, className: string): ReactElement => (
  <Image src={src} alt="" className={className} />
);

const Close = ({ light = true }: { light?: boolean }): ReactElement => (
  <button
    type="button"
    aria-label="Dismiss"
    title="Close"
    className={
      light
        ? 'focus-outline absolute right-2 top-2 z-20 flex size-7 items-center justify-center rounded-10 border border-white/24 bg-overlay-secondary-pepper text-white backdrop-blur-md'
        : 'focus-outline absolute right-2 top-2 z-20 flex size-6 items-center justify-center rounded-8 text-text-tertiary hover:bg-surface-hover'
    }
  >
    <MiniCloseIcon size={IconSize.Size16} aria-hidden />
  </button>
);

const Label = ({ onImage = false }: { onImage?: boolean }): ReactElement => (
  <span
    className={
      onImage
        ? 'font-bold uppercase text-white/90 typo-caption2'
        : 'font-bold uppercase text-brand-default typo-caption2'
    }
  >
    {S.badge}
  </span>
);

const SolidBadge = (): ReactElement => (
  <span className="rounded-6 bg-brand-default px-1.5 py-0.5 font-bold uppercase text-white typo-caption2">
    {S.badge}
  </span>
);

const Title = ({ onImage = false }: { onImage?: boolean }): ReactElement => (
  <h3
    className={
      onImage
        ? 'font-bold text-white typo-callout'
        : 'font-bold text-text-primary typo-callout'
    }
  >
    {S.title}
  </h3>
);

const Desc = ({ onImage = false }: { onImage?: boolean }): ReactElement => (
  <p
    className={
      onImage
        ? 'line-clamp-2 text-white/80 typo-footnote'
        : 'line-clamp-2 text-text-tertiary typo-footnote'
    }
  >
    {S.desc}
  </p>
);

const Cta = (): ReactElement => (
  <Button
    tag="a"
    href="#"
    size={ButtonSize.Small}
    variant={ButtonVariant.Primary}
    className="mt-1 self-start"
  >
    {S.cta}
  </Button>
);

// Full-width bottom scrim so overlaid text stays readable, edge to edge.
const bottomScrim = (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />
);

// ---- Directions -----------------------------------------------------------

const Classic = (): ReactElement => (
  <div className={`${CARD} ${SURFACE} flex flex-col`}>
    {cover(IMG.banner, 'h-28 w-full object-cover')}
    <Close />
    <div className="flex flex-col gap-2 p-3">
      <Label />
      <Title />
      <Desc />
      <Cta />
    </div>
  </div>
);

const OverlayBottom = (): ReactElement => (
  <div className={`${CARD} h-44`}>
    {cover(IMG.feed, 'absolute inset-0 h-full w-full object-cover')}
    {bottomScrim}
    <Close />
    <span className="absolute left-3 top-3">
      <Label onImage />
    </span>
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3">
      <Title onImage />
      <Desc onImage />
      <Cta />
    </div>
  </div>
);

const FullScrim = (): ReactElement => (
  <div className={`${CARD} h-44`}>
    {cover(IMG.tour, 'absolute inset-0 h-full w-full object-cover')}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
    <Close />
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3">
      <Label onImage />
      <Title onImage />
      <Cta />
    </div>
  </div>
);

const BrandWash = (): ReactElement => (
  <div className={`${CARD} h-44`}>
    {cover(IMG.scroll, 'absolute inset-0 h-full w-full object-cover')}
    <div className="pointer-events-none absolute inset-0 bg-brand-default opacity-40 mix-blend-multiply" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-black/80 to-transparent" />
    <Close />
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3">
      <Label onImage />
      <Title onImage />
      <Desc onImage />
    </div>
  </div>
);

const Framed = (): ReactElement => (
  <div className={`${CARD} ${SURFACE} flex flex-col gap-2 p-2`}>
    <div className="relative">
      {cover(IMG.notif, 'h-24 w-full rounded-12 object-cover')}
      <button
        type="button"
        aria-label="Dismiss"
        title="Close"
        className="focus-outline absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-8 border border-white/24 bg-overlay-secondary-pepper text-white backdrop-blur-md"
      >
        <MiniCloseIcon size={IconSize.Size16} aria-hidden />
      </button>
    </div>
    <div className="flex flex-col gap-1.5 px-1 pb-1">
      <Label />
      <Title />
      <Desc />
      <Cta />
    </div>
  </div>
);

const ThumbLeft = (): ReactElement => (
  <div className={`${CARD} ${SURFACE} flex items-center gap-3 p-3`}>
    {cover(IMG.banner, 'size-14 shrink-0 rounded-12 object-cover')}
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <Label />
      <span className="truncate font-bold text-text-primary typo-footnote">
        {S.title}
      </span>
    </span>
    <MoveToIcon
      size={IconSize.XXSmall}
      className="shrink-0 text-text-tertiary"
      aria-hidden
    />
  </div>
);

const HeroMinimal = (): ReactElement => (
  <div className={`${CARD} h-48`}>
    {cover(IMG.tour, 'absolute inset-0 h-full w-full object-cover')}
    {bottomScrim}
    <Close />
    <span className="absolute left-3 top-3">
      <Label onImage />
    </span>
    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-3">
      <Title onImage />
      <MoveToIcon
        size={IconSize.XXSmall}
        className="shrink-0 text-white"
        aria-hidden
      />
    </div>
  </div>
);

const Duotone = (): ReactElement => (
  <div className={`${CARD} h-44`}>
    {cover(IMG.feed, 'absolute inset-0 h-full w-full object-cover grayscale')}
    <div className="pointer-events-none absolute inset-0 bg-brand-default opacity-50 mix-blend-screen" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-black/80 to-transparent" />
    <Close />
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3">
      <Label onImage />
      <Title onImage />
      <Desc onImage />
    </div>
  </div>
);

const FloatingPanel = (): ReactElement => (
  <div className={`${CARD} ${SURFACE}`}>
    {cover(IMG.promo, 'h-28 w-full object-cover')}
    <Close />
    <div className="relative z-10 mx-2 -mt-6 mb-2 flex flex-col gap-1.5 rounded-12 border border-border-subtlest-quaternary bg-background-default p-3 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.45)]">
      <Label />
      <Title />
      <Desc />
      <Cta />
    </div>
  </div>
);

const DualScrim = (): ReactElement => (
  <div className={`${CARD} h-44`}>
    {cover(IMG.notif, 'absolute inset-0 h-full w-full object-cover')}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
    {bottomScrim}
    <Close />
    <span className="absolute left-3 top-3">
      <Label onImage />
    </span>
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3">
      <Title onImage />
      <Desc onImage />
      <Cta />
    </div>
  </div>
);

const CornerBadge = (): ReactElement => (
  <div className={`${CARD} ${SURFACE} flex flex-col`}>
    <div className="relative">
      {cover(IMG.banner, 'h-28 w-full object-cover')}
      <span className="absolute left-3 top-3">
        <SolidBadge />
      </span>
      <Close />
    </div>
    <div className="flex flex-col gap-2 p-3">
      <Title />
      <Desc />
      <Cta />
    </div>
  </div>
);

const GlassPanel = (): ReactElement => (
  <div className={`${CARD} h-44`}>
    {cover(IMG.scroll, 'absolute inset-0 h-full w-full object-cover')}
    <Close />
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 border-t border-white/10 bg-overlay-secondary-pepper p-3 backdrop-blur-md">
      <Label onImage />
      <Title onImage />
      <Desc onImage />
    </div>
  </div>
);

const SplitColor = (): ReactElement => (
  <div className={`${CARD} ${SURFACE} flex flex-col`}>
    <div className="relative">
      {cover(IMG.tour, 'h-24 w-full object-cover')}
      <Close />
    </div>
    <div className="flex flex-col gap-1.5 bg-accent-cabbage-flat p-3">
      <Label />
      <Title />
      <Desc />
      <Cta />
    </div>
  </div>
);

const IconCover = (): ReactElement => (
  <div className={`${CARD} ${SURFACE} flex flex-col`}>
    <div className="relative flex h-24 items-center justify-center bg-gradient-to-br from-accent-cabbage-flat via-accent-onion-flat to-background-subtle">
      <SparkleIcon size={IconSize.XLarge} className="text-brand-default" />
      <Close light={false} />
    </div>
    <div className="flex flex-col gap-2 p-3">
      <Label />
      <Title />
      <Desc />
      <Cta />
    </div>
  </div>
);

const VideoStyle = (): ReactElement => (
  <div className={`${CARD} h-44`}>
    {cover(IMG.feed, 'absolute inset-0 h-full w-full object-cover')}
    {bottomScrim}
    <Close />
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="flex size-12 items-center justify-center rounded-full border border-white/24 bg-overlay-secondary-pepper text-white backdrop-blur-md">
        <PlayIcon size={IconSize.Medium} aria-hidden />
      </span>
    </div>
    <span className="absolute bottom-3 right-3 rounded-6 bg-overlay-secondary-pepper px-1.5 py-0.5 font-bold text-white typo-caption2 backdrop-blur-md">
      1:24
    </span>
    <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3">
      <Label onImage />
      <Title onImage />
    </div>
  </div>
);

const TopAccent = (): ReactElement => (
  <div className={`${CARD} ${SURFACE} flex flex-col gap-2 p-3`}>
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-default to-accent-onion-default" />
    <Close light={false} />
    <span className="flex items-center gap-2 pt-1">
      <MegaphoneIcon size={IconSize.Size16} className="text-brand-default" />
      <Label />
    </span>
    <Title />
    <Desc />
    <Cta />
  </div>
);

const DIRECTIONS: { label: string; note: string; node: ReactNode }[] = [
  {
    label: '01 · Classic',
    note: 'Image on top, content on a surface below.',
    node: <Classic />,
  },
  {
    label: '02 · Overlay (bottom scrim)',
    note: 'Full-bleed image, text over a bottom gradient.',
    node: <OverlayBottom />,
  },
  {
    label: '03 · Full scrim',
    note: 'Edge-to-edge darkening top & bottom.',
    node: <FullScrim />,
  },
  {
    label: '04 · Brand wash',
    note: 'Brand-tinted image, white copy.',
    node: <BrandWash />,
  },
  {
    label: '05 · Framed',
    note: 'Inset rounded image inside a padded card.',
    node: <Framed />,
  },
  {
    label: '06 · Thumbnail row',
    note: 'Compact: square thumb + title + arrow.',
    node: <ThumbLeft />,
  },
  {
    label: '07 · Hero (minimal)',
    note: 'Tall image, just a title + arrow.',
    node: <HeroMinimal />,
  },
  {
    label: '08 · Duotone',
    note: 'Grayscale image + brand blend.',
    node: <Duotone />,
  },
  {
    label: '09 · Floating panel',
    note: 'Content card overlapping the image.',
    node: <FloatingPanel />,
  },
  {
    label: '10 · Dual scrim',
    note: 'Top scrim for controls, bottom for text.',
    node: <DualScrim />,
  },
  {
    label: '11 · Corner badge',
    note: 'Solid brand badge pinned on the image.',
    node: <CornerBadge />,
  },
  {
    label: '12 · Glass panel',
    note: 'Full-width frosted panel over the image.',
    node: <GlassPanel />,
  },
  {
    label: '13 · Split color',
    note: 'Image top, brand-tinted block below.',
    node: <SplitColor />,
  },
  {
    label: '14 · Icon cover',
    note: 'Gradient + icon when there is no photo.',
    node: <IconCover />,
  },
  {
    label: '15 · Video',
    note: 'Play affordance + duration chip.',
    node: <VideoStyle />,
  },
  {
    label: '16 · Top accent',
    note: 'No photo — a full-width brand strip.',
    node: <TopAccent />,
  },
];

const meta: Meta = {
  title: 'Components/Announcements/Cover Directions',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: { disable: true },
  },
};

export default meta;

export const Gallery: StoryObj = {
  render: () => (
    <div className="min-h-screen bg-background-default p-8 text-text-primary">
      <h1 className="font-bold typo-large-title">Announcement cover directions</h1>
      <p className="mt-2 max-w-2xl text-text-secondary typo-body">
        Sixteen ways to present an announcement, all rendered at the real
        ~240px sidebar width. Every image is full-bleed and every gradient/scrim
        spans edge to edge. Pick a direction (or a couple to mix) and I&apos;ll
        wire it into the live component.
      </p>
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-10">
        {DIRECTIONS.map(({ label, note, node }) => (
          <div key={label} className="flex w-60 flex-col gap-2">
            <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
              {label}
            </span>
            {node}
            <span className="text-text-tertiary typo-caption1">{note}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

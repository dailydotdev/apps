import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { SectionHeader, useJoin } from './kit';
import { isTopicChip } from './parts';
import type { StarterPack } from './data';
import { categoryTitle, packForTopic, starterPacks } from './data';

// Starter packs, in the design Tsahi made for the onboarding "Join
// communities" step (dailydotdev/apps#6779, CommunityPackRow and
// PackCover): X's "Who to follow" row with a pack in the person's place.
// Ported here because that PR is not merged; the onboarding packs also hold
// sources and developers, these hold squads only.
//
// Where they show: a section on Discover, a topic's own pack opening its
// list, and the other packs in the Starter packs widget from laptop.

/* -------------------------------------------------------------- cover */

/**
 * The pack's art: four Squad images two by two, round like every Squad
 * image, nothing overlapping, each on a solid disc so transparent logos
 * never show the face behind them.
 */
const PackCover = ({ pack }: { pack: StarterPack }): ReactElement => (
  <span aria-hidden className="relative block size-14 shrink-0">
    <span className="grid size-full grid-cols-2 gap-1">
      {pack.squads.slice(0, 4).map((item) => (
        <span
          key={item.id}
          className="block overflow-hidden rounded-full bg-background-subtle"
        >
          <Image
            alt=""
            className="size-full object-cover"
            src={item.image}
            type={ImageType.Squad}
          />
        </span>
      ))}
    </span>
  </span>
);

/* ---------------------------------------------------------------- row */

const packMembers = (pack: StarterPack): string =>
  largeNumberFormat(
    pack.squads.reduce((sum, item) => sum + item.membersCount, 0),
  ) ?? '0';

export const PackRow = ({
  pack,
  as: Tag = 'li',
}: {
  pack: StarterPack;
  as?: 'li' | 'div';
}): ReactElement => {
  const { isJoined, joinAll } = useJoin();
  // A pack you are fully in drops its button, like a joined squad.
  const missing = pack.squads.filter((item) => !isJoined(item));
  return (
    <Tag className="flex items-center gap-3 py-3">
      <PackCover pack={pack} />
      <span className="flex min-w-0 flex-1 shrink flex-col">
        <span className="truncate font-bold text-text-primary typo-callout">
          {pack.title}
        </span>
        <span className="truncate text-text-secondary typo-footnote">
          {packMembers(pack)} members
        </span>
        <span className="truncate text-text-tertiary typo-footnote">
          {pack.squads.map((item) => item.name).join(', ')}
        </span>
      </span>
      {missing.length > 0 && (
        <Button
          aria-label={`Join the ${pack.title} pack`}
          className="shrink-0"
          onClick={() => joinAll(missing)}
          size={ButtonSize.Small}
          type="button"
          variant={ButtonVariant.Primary}
        >
          Join
        </Button>
      )}
    </Tag>
  );
};

/* ----------------------------------------------------------- surfaces */

/**
 * Every pack as rows: one column up to laptop, two from laptop and three
 * from laptopL, so each row keeps its title and names on one line.
 */
export const PacksSection = ({
  className,
  title = 'Starter packs',
}: {
  className?: string;
  title?: string;
}): ReactElement => (
  <section className={classNames('col-span-full flex flex-col', className)}>
    <SectionHeader
      title={title}
      subtitle="Five Squads that go well together, joined in one tap"
    />
    <ul className="grid grid-cols-1 gap-x-8 laptop:grid-cols-2 laptopL:grid-cols-3">
      {starterPacks.map((pack) => (
        <PackRow key={pack.id} pack={pack} />
      ))}
    </ul>
  </section>
);

/** A topic's own pack, opening that topic, in a highlighted box. */
const PackBanner = ({
  pack,
  className,
}: {
  pack: StarterPack;
  className?: string;
}): ReactElement => (
  <section
    aria-label={`${categoryTitle(pack.topic)} starter pack`}
    className={classNames(
      'col-span-full rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-1',
      className,
    )}
  >
    <PackRow pack={pack} as="div" />
  </section>
);

/**
 * A topic's list opens with its own pack at every width; the Starter packs
 * widget beside it offers the other packs.
 */
export const withPacks = (chip: string, nodes: ReactNode[]): ReactNode[] => {
  const pack = isTopicChip(chip) ? packForTopic(chip) : undefined;
  return pack
    ? [<PackBanner key="pack" pack={pack} className="mb-2" />, ...nodes]
    : nodes;
};

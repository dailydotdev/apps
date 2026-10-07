import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import type { CommunityPackMember } from './communityPacks';
import { CommunityPackMemberType } from './communityPacks';

export type PackCoverVariant = 'gallery' | 'stack' | 'shingle';

const motion =
  'transition-all duration-300 ease-out motion-reduce:transition-none';

// Every face sits on a solid tile, so logos with transparent backgrounds
// never show the face behind them.
const Tile = ({
  member,
  className,
  style,
}: {
  member: CommunityPackMember;
  className?: string;
  style?: CSSProperties;
}): ReactElement => (
  <span
    className={classNames(
      'block overflow-hidden bg-background-subtle',
      motion,
      className,
    )}
    style={style}
  >
    <Image
      alt=""
      className="size-full object-cover"
      src={member.image}
      type={
        member.type === CommunityPackMemberType.User
          ? ImageType.Avatar
          : ImageType.Squad
      }
    />
  </span>
);

const keyOf = ({ type, id }: CommunityPackMember): string => `${type}:${id}`;

// Four faces two by two: square, nothing overlaps, every face whole. No tray
// behind them, so it reads as the faces themselves rather than a box.
const Gallery = ({
  members,
}: {
  members: CommunityPackMember[];
  isJoined: boolean;
}): ReactElement => (
  <span className="grid size-full grid-cols-2 gap-1">
    {members.slice(0, 4).map((member) => (
      <Tile key={keyOf(member)} className="rounded-8" member={member} />
    ))}
  </span>
);

// A pack of cards: the lead in front, two more squared up behind it. Joined,
// the cards behind fan out a little.
const Stack = ({
  members,
  isJoined,
}: {
  members: CommunityPackMember[];
  isJoined: boolean;
}): ReactElement => {
  const [lead, ...rest] = members;
  const behind = rest.slice(0, 2).reverse();

  return (
    <>
      {behind.map((member, index) => {
        const depth = behind.length - index;
        const offset = (isJoined ? 17 : 14) * depth;

        return (
          <Tile
            key={keyOf(member)}
            className="absolute bottom-0 left-0 size-[72%] rounded-12 shadow-2-black ring-2 ring-background-default"
            member={member}
            style={{
              transform: `translate(${offset}%, ${-offset}%) rotate(${
                isJoined ? depth * 4 : 0
              }deg)`,
              zIndex: index,
            }}
          />
        );
      })}
      {lead && (
        <Tile
          className="absolute bottom-0 left-0 z-2 size-[72%] rounded-12 shadow-2-black ring-2 ring-background-default"
          member={lead}
        />
      )}
    </>
  );
};

// Shingles: four tiles laid diagonally, each overlapping the last, the lead
// on top. Joined, they spread apart.
const Shingle = ({
  members,
  isJoined,
}: {
  members: CommunityPackMember[];
  isJoined: boolean;
}): ReactElement => {
  const tiles = members.slice(0, 4);
  const step = isJoined ? 15 : 13;

  return (
    <>
      {tiles
        .map((member, index) => ({ member, index }))
        .reverse()
        .map(({ member, index }) => (
          <Tile
            key={keyOf(member)}
            className="absolute size-[58%] rounded-6 ring-2 ring-background-default"
            member={member}
            style={{
              left: `${index * step}%`,
              top: `${index * step}%`,
              zIndex: tiles.length - index,
            }}
          />
        ))}
    </>
  );
};

// The pack's art: a square, so it never crowds the title on a phone.
export const PackCover = ({
  members,
  isJoined,
  variant = 'gallery',
}: {
  members: CommunityPackMember[];
  isJoined: boolean;
  variant?: PackCoverVariant;
}): ReactElement => {
  const Art = { gallery: Gallery, stack: Stack, shingle: Shingle }[variant];

  return (
    <span aria-hidden className="relative block size-14 shrink-0">
      <Art isJoined={isJoined} members={members} />
    </span>
  );
};

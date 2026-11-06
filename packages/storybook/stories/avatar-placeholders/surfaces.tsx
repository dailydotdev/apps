import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons/Upvote';
import { DiscussIcon } from '@dailydotdev/shared/src/components/icons/Discuss';
import { AtIcon } from '@dailydotdev/shared/src/components/icons/At';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { MedalIcon } from '@dailydotdev/shared/src/components/icons/Medal';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { MockPerson } from './data';
import {
  AvatarMode,
  dailyDevTeam,
  getCharacterSrc,
  people,
  pickableCharacters,
  placeholderAvatarSrc,
  resolveAvatarSrc,
} from './data';
import { Chip, useAvatarMode } from './shell';

export const sizeToPx: Record<ProfileImageSize, number> = {
  [ProfileImageSize.Size16]: 16,
  [ProfileImageSize.XSmall]: 20,
  [ProfileImageSize.Small]: 24,
  [ProfileImageSize.Medium]: 32,
  [ProfileImageSize.Large]: 40,
  [ProfileImageSize.XLarge]: 48,
  [ProfileImageSize.XXLarge]: 56,
  [ProfileImageSize.XXXLarge]: 64,
  [ProfileImageSize.XXXXLarge]: 96,
};

/** The production atom, fed whatever the resolver would hand it. */
export const PersonAvatar = ({
  person,
  size,
  mode: modeOverride,
  className,
}: {
  person: MockPerson;
  size: ProfileImageSize;
  mode?: AvatarMode;
  className?: string;
}): ReactElement => {
  const contextMode = useAvatarMode();
  const mode = modeOverride ?? contextMode;
  const src = resolveAvatarSrc(person, sizeToPx[size], mode);

  return (
    <ProfilePicture
      key={src}
      user={{ id: person.id, username: person.username, image: src }}
      size={size}
      eager
      className={classNames('ap-swap', className)}
    />
  );
};

const OfficialBadge = (): ReactElement => (
  <Chip className="bg-overlay-float-cabbage text-accent-cabbage-default">
    daily.dev
  </Chip>
);

const Comment = ({
  person,
  time,
  children,
  upvotes,
  nested,
  mode,
}: {
  person: MockPerson;
  time: string;
  children: ReactNode;
  upvotes: number;
  nested?: boolean;
  mode?: AvatarMode;
}): ReactElement => (
  <div className={classNames('flex gap-3', nested && 'ml-11')}>
    <PersonAvatar
      person={person}
      size={nested ? ProfileImageSize.Medium : ProfileImageSize.Large}
      mode={mode}
    />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-1.5">
        <span className="font-bold text-text-primary typo-callout">
          {person.name}
        </span>
        {person.official && <OfficialBadge />}
        <span className="text-text-quaternary typo-footnote">
          @{person.username} · {time}
        </span>
      </div>
      <p className="ap-pretty text-text-primary typo-callout">{children}</p>
      <div className="flex items-center gap-4 pt-1 text-text-tertiary typo-footnote">
        <span className="flex items-center gap-1">
          <UpvoteIcon size={IconSize.Size16} /> {upvotes}
        </span>
        <span className="flex items-center gap-1">
          <DiscussIcon size={IconSize.Size16} /> Reply
        </span>
      </div>
    </div>
  </div>
);

export const CommentThread = ({
  mode,
  withOfficial = true,
}: {
  mode?: AvatarMode;
  withOfficial?: boolean;
}): ReactElement => (
  <div className="flex flex-col gap-5">
    <Comment person={people[0]} time="2h" upvotes={48} mode={mode}>
      The part about moving the cache key to the edge saved us a whole region.
      Did anyone try this with Next middleware?
    </Comment>
    <Comment person={people[1]} time="1h" upvotes={12} nested mode={mode}>
      Yes, works fine as long as you strip the cookies first.
    </Comment>
    <Comment person={people[2]} time="58m" upvotes={7} nested mode={mode}>
      Watch out for the Vary header, it bit us twice.
    </Comment>
    {withOfficial && (
      <Comment person={dailyDevTeam} time="40m" upvotes={31} nested mode={mode}>
        Pinned the write-up the author mentioned to the post. Thanks for
        flagging it.
      </Comment>
    )}
    <Comment person={people[3]} time="12m" upvotes={3} mode={mode}>
      Bookmarked for the next on-call week.
    </Comment>
  </div>
);

export const FeedCardHeader = (): ReactElement => (
  <div className="flex w-full max-w-[20rem] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3">
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className="flex size-8 items-center justify-center rounded-10 bg-accent-cabbage-default font-bold text-white typo-footnote">
          JS
        </span>
        <span className="ap-cutout absolute -bottom-1 -right-1 flex rounded-6">
          <PersonAvatar person={people[4]} size={ProfileImageSize.XSmall} />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-footnote">
          JavaScript Weekly
        </span>
        <span className="truncate text-text-tertiary typo-caption1">
          Shared by {people[4].name}
        </span>
      </div>
    </div>
    <p className="ap-balance font-bold typo-title3">
      Signals are coming to the platform, here is what changes
    </p>
    <div className="h-28 rounded-12 bg-surface-float" />
    <div className="flex items-center gap-2">
      <div className="ap-stack flex">
        {people.slice(5, 8).map((person) => (
          <PersonAvatar
            key={person.id}
            person={person}
            size={ProfileImageSize.Small}
          />
        ))}
      </div>
      <span className="text-text-tertiary typo-caption1">
        Upvoted by {people[5].name} and 212 others
      </span>
    </div>
  </div>
);

export const SquadMembers = (): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-3">
      <div className="ap-stack flex">
        {people.slice(0, 6).map((person) => (
          <PersonAvatar
            key={person.id}
            person={person}
            size={ProfileImageSize.Medium}
          />
        ))}
      </div>
      <span className="font-bold text-text-tertiary typo-footnote">+1.2k</span>
    </div>
    <ul className="flex flex-col gap-3">
      {people.slice(6, 10).map((person, index) => (
        <li key={person.id} className="flex items-center gap-3">
          <PersonAvatar person={person} size={ProfileImageSize.Large} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-bold typo-callout">
              {person.name}
            </span>
            <span className="truncate text-text-tertiary typo-footnote">
              @{person.username}
            </span>
          </div>
          {index === 0 && <Chip>Moderator</Chip>}
        </li>
      ))}
    </ul>
  </div>
);

export const NotificationList = (): ReactElement => (
  <ul className="flex flex-col">
    {[
      { person: people[2], text: 'upvoted your comment', time: '3m' },
      { person: people[8], text: 'replied to your post', time: '1h' },
      { person: dailyDevTeam, text: 'Your weekly digest is ready', time: '5h' },
      { person: people[10], text: 'started following you', time: '1d' },
    ].map(({ person, text, time }) => (
      <li
        key={`${person.id}-${text}`}
        className="flex items-center gap-3 rounded-12 px-2 py-2.5 hover:bg-surface-hover"
      >
        <PersonAvatar person={person} size={ProfileImageSize.Large} />
        <p className="min-w-0 flex-1 text-text-tertiary typo-callout">
          <span className="font-bold text-text-primary">{person.name}</span>{' '}
          {text}
        </p>
        <span className="text-text-quaternary typo-caption1">{time}</span>
      </li>
    ))}
  </ul>
);

export const MentionPopover = (): ReactElement => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-default px-3 py-2 text-text-tertiary typo-callout">
      Great point <AtIcon size={IconSize.Size16} />
      <span className="text-text-link">am</span>
      <span className="h-4 w-px bg-text-primary" />
    </div>
    <div className="ap-elevated flex w-64 flex-col rounded-14 border border-border-subtlest-tertiary bg-background-default p-1">
      {[people[6], people[11], people[4]].map((person, index) => (
        <div
          key={person.id}
          className={classNames(
            'flex items-center gap-2 rounded-10 px-2 py-1.5',
            index === 0 && 'bg-surface-hover',
          )}
        >
          <PersonAvatar person={person} size={ProfileImageSize.Small} />
          <span className="truncate font-bold typo-footnote">
            {person.name}
          </span>
          <span className="truncate text-text-quaternary typo-caption1">
            @{person.username}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const SearchPeople = (): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2 text-text-tertiary typo-callout">
      <SearchIcon size={IconSize.Size16} /> rust
    </div>
    {[people[9], people[7], people[1]].map((person) => (
      <div key={person.id} className="flex items-center gap-3">
        <PersonAvatar person={person} size={ProfileImageSize.Large} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold typo-callout">{person.name}</span>
          <span className="truncate text-text-tertiary typo-footnote">
            @{person.username} · 2.1k reputation
          </span>
        </div>
      </div>
    ))}
  </div>
);

export const Leaderboard = (): ReactElement => (
  <ol className="flex flex-col gap-2">
    {[people[11], people[0], people[5], people[2], people[8]].map(
      (person, index) => (
        <li key={person.id} className="flex items-center gap-3">
          <span className="ap-tabular w-4 text-center font-bold text-text-tertiary typo-footnote">
            {index + 1}
          </span>
          <PersonAvatar person={person} size={ProfileImageSize.Medium} />
          <span className="min-w-0 flex-1 truncate font-bold typo-callout">
            {person.name}
          </span>
          {index === 0 && (
            <MedalIcon
              size={IconSize.Size16}
              className="text-accent-cheese-default"
            />
          )}
          <span className="ap-tabular text-text-tertiary typo-footnote">
            {[412, 388, 301, 297, 240][index]}
          </span>
        </li>
      ),
    )}
  </ol>
);

export const ProfileHeaderMock = ({
  person,
}: {
  person: MockPerson;
}): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="h-20 rounded-16 bg-surface-float" />
    <div className="-mt-14 flex items-end px-3">
      <PersonAvatar
        person={person}
        size={ProfileImageSize.XXXXLarge}
        className="ap-cutout-lg"
      />
    </div>
    <div className="flex flex-col gap-0.5 px-3">
      <span className="font-bold typo-title3">{person.name}</span>
      <span className="text-text-tertiary typo-callout">
        @{person.username} · Joined June 2026
      </span>
    </div>
  </div>
);

export const LoggedOutComposer = (): ReactElement => {
  const mode = useAvatarMode();
  const [isActive, setIsActive] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive || mode === AvatarMode.Today) {
      return undefined;
    }

    const interval = window.setInterval(
      () => setIndex((value) => (value + 1) % pickableCharacters.length),
      700,
    );
    return () => window.clearInterval(interval);
  }, [isActive, mode]);

  const current = pickableCharacters[index];
  const isToday = mode === AvatarMode.Today;

  return (
    <div
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default px-3 py-2.5">
        <img
          key={isToday ? 'today' : current.id}
          src={isToday ? placeholderAvatarSrc : getCharacterSrc(current, 32)}
          alt=""
          className="ap-swap size-8 rounded-10 object-cover"
        />
        <input
          aria-label="Share your thoughts"
          placeholder="Share your thoughts"
          className="min-w-0 flex-1 bg-transparent text-text-primary typo-callout placeholder:text-text-quaternary focus:outline-none"
        />
        <span className="rounded-10 bg-text-primary px-3 py-1 font-bold text-surface-invert typo-footnote">
          Post
        </span>
      </div>
      <span className="px-1 text-text-quaternary typo-caption1">
        {isToday && 'Today: the silhouette stands in for you.'}
        {!isToday &&
          (isActive
            ? `This could be you, as ${current.name} or with your own photo.`
            : 'Hover or focus to meet who you could be.')}
      </span>
    </div>
  );
};

export const TodayAvatar = ({ sizePx }: { sizePx: number }): ReactElement => (
  <img
    src={placeholderAvatarSrc}
    alt="Today's placeholder"
    style={{ width: sizePx, height: sizePx }}
    className="shrink-0 rounded-10 object-cover"
  />
);

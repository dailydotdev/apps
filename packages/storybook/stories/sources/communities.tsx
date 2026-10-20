import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import type { Person, Squad } from './data';
import {
  FollowAction,
  followButtonClassName,
  formatCount,
  useSources,
} from './kit';

// A topic's Squads (Join) and the developers writing about it (Follow),
// shared by the layouts that put them beside a topic's sources.

// Join, like the squads directory: a joined Squad shows no button, and
// the toast's Undo brings it back.
export const JoinButton = ({
  squad,
}: {
  squad: Squad;
}): ReactElement | null => {
  const { members, addMember } = useSources();
  if (members.has(`squad:${squad.id}`)) {
    return null;
  }
  return (
    <Button
      type="button"
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Primary}
      className={classNames(followButtonClassName, 'shrink-0')}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        addMember(`squad:${squad.id}`, squad.name, 'squad');
      }}
    >
      Join
    </Button>
  );
};

export const PersonFollow = ({
  person,
}: {
  person: Person;
}): ReactElement | null => {
  const { members, addMember } = useSources();
  return (
    <FollowAction
      isFollowing={members.has(`user:${person.id}`)}
      onFollow={() => addMember(`user:${person.id}`, person.name, 'user')}
    />
  );
};

export const SquadRow = ({ squad }: { squad: Squad }): ReactElement => {
  const { goTo } = useSources();
  return (
    <a
      href={`https://daily.dev/squads/${squad.handle}`}
      onClick={(event) => {
        event.preventDefault();
        goTo(`/squads/${squad.handle}`);
      }}
      className="flex items-center gap-3 rounded-14 px-2 py-2 hover:bg-surface-hover"
    >
      <Image
        src={squad.image}
        alt=""
        className="size-10 shrink-0 rounded-12 bg-surface-float object-cover"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-callout">{squad.name}</span>
        <span className="sx-nums truncate text-text-tertiary typo-footnote">
          {formatCount(squad.members)} members
          {squad.description && ` · ${squad.description}`}
        </span>
      </span>
      <JoinButton squad={squad} />
    </a>
  );
};

export const PersonRow = ({ person }: { person: Person }): ReactElement => {
  const { goTo } = useSources();
  return (
    <a
      href={`https://daily.dev/${person.username}`}
      onClick={(event) => {
        event.preventDefault();
        goTo(`/${person.username}`);
      }}
      className="flex items-center gap-3 rounded-14 px-2 py-2 hover:bg-surface-hover"
    >
      <Image
        src={person.image}
        alt=""
        className="size-10 shrink-0 rounded-full bg-surface-float object-cover"
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-callout">{person.name}</span>
        <span className="truncate text-text-tertiary typo-footnote">
          @{person.username}
          {person.bio && ` · ${person.bio}`}
        </span>
      </span>
      <PersonFollow person={person} />
    </a>
  );
};

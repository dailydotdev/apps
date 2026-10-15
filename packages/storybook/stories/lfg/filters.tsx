import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';
import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import {
  Drawer,
  DrawerPosition,
} from '@dailydotdev/shared/src/components/drawers/Drawer';
import { TagElement } from '@dailydotdev/shared/src/components/tags/TagElement';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { ReputationIcon } from '@dailydotdev/shared/src/components/icons/Reputation';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import type { LfgPost, LfgUser } from './data';
import {
  me,
  myFollowedTags,
  NOW,
  PostStatus,
  REPUTATION_STEPS,
  UTC_OFFSETS,
} from './data';
import type { BoardFilters, ProtoState } from './store';
import { noFilters, userFor } from './store';
import { formatOffset, formatReputation, SectionLabel } from './ui';

const openPosts = (state: ProtoState): LfgPost[] =>
  state.posts.filter((post) => post.status === PostStatus.Open);

// The reader's time zone first, then every one somebody posts from.
export const boardZones = (state: ProtoState): number[] => [
  ...new Set([
    me.utcOffset,
    ...openPosts(state)
      .map((post) => userFor(state, post.authorId).utcOffset)
      .sort((a, b) => a - b),
  ]),
];

// For alerts, which are about posts that don't exist yet.
export const allZones: number[] = [
  me.utcOffset,
  ...UTC_OFFSETS.filter((offset) => offset !== me.utcOffset),
];

export const boardTags = (state: ProtoState): string[] =>
  [...new Set(openPosts(state).flatMap((post) => post.tags))].sort();

export const hasFilters = (filters: BoardFilters): boolean =>
  filters.timezones.length > 0 ||
  filters.tags.length > 0 ||
  filters.minReputation > 0;

export const matchesFilters = (
  filters: BoardFilters,
  post: LfgPost,
  author: LfgUser,
): boolean =>
  (!filters.timezones.length || filters.timezones.includes(author.utcOffset)) &&
  (!filters.tags.length ||
    post.tags.some((tag) => filters.tags.includes(tag))) &&
  author.reputation >= filters.minReputation;

const clock = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

// Local time beats a bare offset when choosing who you'll talk to at night.
const zoneDetail = (offset: number): string => {
  const now = clock.format(new Date(NOW.getTime() + offset * 3_600_000));
  const gap = offset - me.utcOffset;
  if (!gap) {
    return `${now} now · Your time zone`;
  }
  return `${now} now · ${Math.abs(gap)}h ${gap > 0 ? 'ahead' : 'behind'}`;
};

const toggled = <T,>(list: T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

// The search page's filter buttons: a Float button over a menu, which is a
// sheet on phones. The label carries the value.
const FilterMenu = ({
  label,
  icon,
  contentClassName,
  children,
}: {
  label: ReactNode;
  icon: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}): ReactElement => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={icon}
      >
        {label}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className={contentClassName}>
      {children}
    </DropdownMenuContent>
  </DropdownMenu>
);

const MenuSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2 p-2">
    <SectionLabel>{title}</SectionLabel>
    {children}
  </section>
);

const TimeZoneList = ({
  zones,
  value,
  onChange,
}: {
  zones: number[];
  value: number[];
  onChange: (value: number[]) => void;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    {zones.map((offset) => (
      <Checkbox
        key={offset}
        name={`lfg-zone-${offset}`}
        checked={value.includes(offset)}
        onToggleCallback={() => onChange(toggled(value, offset))}
      >
        <span className="flex flex-col">
          <span className="text-text-primary typo-callout">
            {formatOffset(offset)}
          </span>
          <span className="font-normal text-text-tertiary">
            {zoneDetail(offset)}
          </span>
        </span>
      </Checkbox>
    ))}
  </div>
);

// Tags the reader follows come first as the suggestion, then every tag on
// the board.
const TopicGroups = ({
  tags,
  value,
  onChange,
}: {
  tags: string[];
  value: string[];
  onChange: (value: string[]) => void;
}): ReactElement => {
  const suggested = myFollowedTags.filter((tag) => tags.includes(tag));
  const groups = [
    { title: 'Tags you follow', items: suggested },
    {
      title: suggested.length ? 'More topics' : 'Topics',
      items: tags.filter((tag) => !suggested.includes(tag)),
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <SectionLabel>{group.title}</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {group.items.map((tag) => (
              <TagElement
                key={tag}
                tag={{ name: `#${tag}` }}
                isSelected={value.includes(tag)}
                onClick={() => onChange(toggled(value, tag))}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const reputationSteps = [0, ...REPUTATION_STEPS];

const reputationLabel = (step: number): string =>
  step ? formatReputation(step) : 'Any reputation';

export const TimeZoneFilter = ({
  zones,
  value,
  onChange,
  placeholder = 'Time zone',
}: {
  zones: number[];
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
}): ReactElement => {
  let label = placeholder;
  if (value.length === 1) {
    label = formatOffset(value[0]);
  } else if (value.length > 1) {
    label = `${value.length} time zones`;
  }

  return (
    <FilterMenu label={label} icon={<EarthIcon />} contentClassName="w-72">
      <MenuSection title="Time zone">
        <TimeZoneList zones={zones} value={value} onChange={onChange} />
      </MenuSection>
    </FilterMenu>
  );
};

export const TopicsFilter = ({
  tags,
  value,
  onChange,
}: {
  tags: string[];
  value: string[];
  onChange: (value: string[]) => void;
}): ReactElement => {
  let label = 'Topics';
  if (value.length === 1) {
    label = `#${value[0]}`;
  } else if (value.length > 1) {
    label = `${value.length} topics`;
  }

  return (
    <FilterMenu label={label} icon={<HashtagIcon />} contentClassName="w-80">
      <div className="p-2">
        <TopicGroups tags={tags} value={value} onChange={onChange} />
      </div>
    </FilterMenu>
  );
};

export const ReputationFilter = ({
  value,
  onChange,
  placeholder = 'Reputation',
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}): ReactElement => (
  <FilterMenu
    label={value ? formatReputation(value) : placeholder}
    icon={<ReputationIcon />}
  >
    {reputationSteps.map((step) => (
      <DropdownMenuItem
        key={step}
        onClick={() => onChange(step)}
        className={classNames(
          'flex',
          value === step ? 'font-bold text-text-primary' : 'text-text-tertiary',
        )}
      >
        {reputationLabel(step)}
        <div className="flex-1" />
        {value === step && <VIcon className="ml-2" />}
      </DropdownMenuItem>
    ))}
  </FilterMenu>
);

// The phone's one sheet for every filter, as search does it
// (SearchMobileFiltersButton).
const SheetSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
    <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
    {children}
  </section>
);

export const FiltersSheet = ({
  filters,
  zones,
  tags,
  onChange,
  onClose,
}: {
  filters: BoardFilters;
  zones: number[];
  tags: string[];
  onChange: (filters: Partial<BoardFilters>) => void;
  onClose: () => void;
}): ReactElement => (
  <Drawer
    isOpen
    onClose={onClose}
    position={DrawerPosition.Bottom}
    appendOnRoot
    title="Filters"
    className={{ drawer: 'px-4 pb-4 pt-2' }}
  >
    <div className="flex flex-col gap-5">
      <SheetSection title="Time zone">
        <TimeZoneList
          zones={zones}
          value={filters.timezones}
          onChange={(timezones) => onChange({ timezones })}
        />
      </SheetSection>
      <SheetSection title="Topics">
        <TopicGroups
          tags={tags}
          value={filters.tags}
          onChange={(value) => onChange({ tags: value })}
        />
      </SheetSection>
      <SheetSection title="Reputation">
        <div className="flex flex-col gap-1">
          {reputationSteps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange({ minReputation: step })}
              className={classNames(
                'flex h-10 items-center rounded-8 px-3 text-left typo-callout',
                filters.minReputation === step
                  ? 'font-bold text-text-primary'
                  : 'text-text-tertiary',
              )}
            >
              {reputationLabel(step)}
              <span className="flex-1" />
              {filters.minReputation === step && <VIcon className="ml-2" />}
            </button>
          ))}
        </div>
      </SheetSection>
      {hasFilters(filters) && (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          onClick={() => onChange(noFilters)}
        >
          Clear filters
        </Button>
      )}
    </div>
  </Drawer>
);

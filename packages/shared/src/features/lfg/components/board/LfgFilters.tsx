import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useDropdownMenuIsPhone,
} from '../../../../components/dropdown/DropdownMenu';
import { Checkbox } from '../../../../components/fields/Checkbox';
import { Drawer, DrawerPosition } from '../../../../components/drawers/Drawer';
import { TagElement } from '../../../../components/tags/TagElement';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { EarthIcon } from '../../../../components/icons/Earth';
import { HashtagIcon } from '../../../../components/icons/Hashtag';
import { ReputationIcon } from '../../../../components/icons/Reputation';
import { VIcon } from '../../../../components/icons/V';
import type { LfgBoardFilters } from '../../types';
import { LFG_REPUTATION_STEPS } from '../../constants';
import {
  formatLfgReputation,
  formatUtcOffset,
  getUtcOffsetDetail,
} from '../../lib/format';
import { getLfgTagLabel } from '../LfgTags';

export type LfgFilterValues = Omit<LfgBoardFilters, 'kind'>;

export const noLfgFilters: LfgFilterValues = {
  timezones: [],
  tags: [],
  minReputation: 0,
};

export const hasLfgFilters = (filters: LfgFilterValues): boolean =>
  filters.timezones.length > 0 ||
  filters.tags.length > 0 ||
  filters.minReputation > 0;

const toggled = <T,>(list: T[], value: T): T[] =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

const reputationSteps = [0, ...LFG_REPUTATION_STEPS];

const reputationLabel = (step: number): string =>
  step ? formatLfgReputation(step) : 'Any reputation';

const FilterLabel = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    type={TypographyType.Footnote}
    color={TypographyColor.Tertiary}
    bold
  >
    {children}
  </Typography>
);

const filterMenuScrollableClassName =
  'max-h-[min(24rem,var(--radix-dropdown-menu-content-available-height))]';

// The search page's filter buttons: a Float button over a menu, which is a
// sheet on phones. The label carries the value.
const FilterMenu = ({
  label,
  icon,
  contentClassName,
  children,
}: {
  label: ReactNode;
  icon: ReactElement;
  contentClassName?: string;
  children: ReactNode;
}): ReactElement => {
  const isPhone = useDropdownMenuIsPhone();

  return (
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
      <DropdownMenuContent
        align="start"
        className={contentClassName}
        scrollableClassName={
          isPhone ? undefined : filterMenuScrollableClassName
        }
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TimeZoneList = ({
  zones,
  localOffset,
  value,
  onChange,
}: {
  zones: number[];
  localOffset: number;
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
            {formatUtcOffset(offset)}
          </span>
          <span className="font-normal text-text-tertiary">
            {getUtcOffsetDetail(offset, localOffset)}
          </span>
        </span>
      </Checkbox>
    ))}
  </div>
);

// Tags the reader follows come first as the suggestion, then every other
// tag on the board.
const TopicGroups = ({
  tags,
  followedTags,
  value,
  onChange,
}: {
  tags: string[];
  followedTags: string[];
  value: string[];
  onChange: (value: string[]) => void;
}): ReactElement => {
  const groups = useMemo(() => {
    const suggested = followedTags.filter((tag) => tags.includes(tag));

    return [
      { title: 'Tags you follow', items: suggested },
      {
        title: suggested.length ? 'More topics' : 'Topics',
        items: tags.filter((tag) => !suggested.includes(tag)),
      },
    ].filter((group) => group.items.length > 0);
  }, [followedTags, tags]);

  if (!groups.length) {
    return (
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        No topics on the board yet.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <FilterLabel>{group.title}</FilterLabel>
          <div className="flex flex-wrap gap-2">
            {group.items.map((tag) => (
              <TagElement
                key={tag}
                tag={{ name: getLfgTagLabel(tag) }}
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

interface TimeZoneFilterProps {
  zones: number[];
  localOffset: number;
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
}

export const LfgTimeZoneFilter = ({
  zones,
  localOffset,
  value,
  onChange,
  placeholder = 'Time zone',
}: TimeZoneFilterProps): ReactElement => {
  let label = placeholder;

  if (value.length === 1) {
    label = formatUtcOffset(value[0]);
  } else if (value.length > 1) {
    label = `${value.length} time zones`;
  }

  return (
    <FilterMenu label={label} icon={<EarthIcon />} contentClassName="w-72">
      <section className="flex flex-col gap-2 p-2">
        <FilterLabel>Time zone</FilterLabel>
        <TimeZoneList
          zones={zones}
          localOffset={localOffset}
          value={value}
          onChange={onChange}
        />
      </section>
    </FilterMenu>
  );
};

export const LfgTopicsFilter = ({
  tags,
  followedTags,
  value,
  onChange,
}: {
  tags: string[];
  followedTags: string[];
  value: string[];
  onChange: (value: string[]) => void;
}): ReactElement => {
  let label = 'Topics';

  if (value.length === 1) {
    label = getLfgTagLabel(value[0]);
  } else if (value.length > 1) {
    label = `${value.length} topics`;
  }

  return (
    <FilterMenu label={label} icon={<HashtagIcon />} contentClassName="w-80">
      <div className="p-2">
        <TopicGroups
          tags={tags}
          followedTags={followedTags}
          value={value}
          onChange={onChange}
        />
      </div>
    </FilterMenu>
  );
};

export const LfgReputationFilter = ({
  value,
  onChange,
  placeholder = 'Reputation',
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}): ReactElement => (
  <FilterMenu
    label={value ? formatLfgReputation(value) : placeholder}
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

// The phone's one sheet for every filter, as search does it.
export const LfgFiltersSheet = ({
  filters,
  zones,
  localOffset,
  tags,
  followedTags,
  onChange,
  onClear,
  onClose,
}: {
  filters: LfgFilterValues;
  zones: number[];
  localOffset: number;
  tags: string[];
  followedTags: string[];
  onChange: (filters: Partial<LfgFilterValues>) => void;
  onClear: () => void;
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
          localOffset={localOffset}
          value={filters.timezones}
          onChange={(timezones) => onChange({ timezones })}
        />
      </SheetSection>
      <SheetSection title="Topics">
        <TopicGroups
          tags={tags}
          followedTags={followedTags}
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
      {hasLfgFilters(filters) && (
        <Button type="button" variant={ButtonVariant.Float} onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  </Drawer>
);

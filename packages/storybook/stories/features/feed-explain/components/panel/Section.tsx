import type { ReactElement, ReactNode } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { ControlSection } from '../FeedScreenContext';

export const sectionId = (section: ControlSection): string =>
  `personalization-${section}`;

/**
 * A block of settings laid out like the feed settings sections: a bold title
 * and a tertiary description over the controls.
 */
export const PanelSection = ({
  section,
  title,
  description,
  actions,
  children,
  className,
}: {
  section: ControlSection;
  /** Left out when the section is the whole page, under the page's title. */
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <section
    id={sectionId(section)}
    aria-labelledby={title ? `${sectionId(section)}-title` : undefined}
    className={classNames('flex scroll-mt-24 flex-col gap-4', className)}
  >
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 flex-[1_1_20rem] flex-col gap-1">
        {title && (
          <Typography
            id={`${sectionId(section)}-title`}
            tag={TypographyTag.H2}
            type={TypographyType.Body}
            bold
          >
            {title}
          </Typography>
        )}
        {description && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        )}
      </div>
      {actions}
    </header>
    {children}
  </section>
);

/** A titled list of rows, like "My tags" on the Tags page. */
export const PanelList = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <header className="flex flex-col gap-1">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Body}
        className="tablet:typo-title3"
        bold
      >
        {title}
      </Typography>
      {description && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      )}
    </header>
    <ul className="flex flex-col @container">{children}</ul>
  </div>
);

export const PanelListEmpty = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <li className="py-2">
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </li>
);

/**
 * One topic, source or person: who it is, its boost and one action. The boost
 * sits between them on a wide list and under them on a narrow one.
 */
export const EntityRow = ({
  media,
  name,
  description,
  boost,
  action,
}: {
  media?: ReactNode;
  name: string;
  description?: string;
  boost?: ReactNode;
  action: ReactNode;
}): ReactElement => (
  <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 @2xl:grid-cols-[minmax(0,1fr)_16rem_auto]">
    <span className="flex min-w-0 items-center gap-3">
      {media}
      <span className="flex min-w-0 shrink flex-col">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          className="truncate"
          bold
        >
          {name}
        </Typography>
        {description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        )}
      </span>
    </span>
    {boost && (
      <span className="col-span-2 row-start-2 flex min-w-0 @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1">
        {boost}
      </span>
    )}
    <span className="col-start-2 row-start-1 flex @2xl:col-start-3">
      {action}
    </span>
  </li>
);

/**
 * Keeps lists in the order and grouping they had when they opened, so a
 * click shows its result in place instead of moving rows. A row stays in its
 * first list even when its state would put it in another, and rows that
 * appear later join the end of theirs. Opening again sorts afresh.
 */
export const useFrozenGroups = <G extends string>(
  groups: Record<G, string[]>,
): Record<G, string[]> => {
  const frozen = useRef<{ order: string[]; groupOf: Map<string, G> }>({
    order: [],
    groupOf: new Map(),
  });
  const names = Object.keys(groups) as G[];
  names.forEach((group) =>
    groups[group].forEach((key) => {
      if (!frozen.current.groupOf.has(key)) {
        frozen.current.groupOf.set(key, group);
        frozen.current.order.push(key);
      }
    }),
  );
  const result = Object.fromEntries(
    names.map((group) => [group, [] as string[]]),
  ) as Record<G, string[]>;
  frozen.current.order.forEach((key) => {
    const group = frozen.current.groupOf.get(key);
    if (group && result[group]) {
      result[group].push(key);
    }
  });
  return result;
};

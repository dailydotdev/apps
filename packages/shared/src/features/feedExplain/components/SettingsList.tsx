import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FeedSettingsMenu } from '../../../components/feeds/FeedSettings/types';
import { useOpenForYouSettingsPage } from '../../../components/feeds/FeedSettings/forYouSettingsPages';

/** A titled list of topics, sources or people on a Feed settings page. */
export const SettingsList = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
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
  </section>
);

export const SettingsListEmpty = ({
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
export const SettingsRow = ({
  media,
  name,
  description,
  descriptionClassName,
  boost,
  action,
}: {
  media?: ReactNode;
  name: string;
  description?: string;
  descriptionClassName?: string;
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
            color={descriptionClassName ? undefined : TypographyColor.Tertiary}
            className={descriptionClassName}
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

/** One line where a list of blocks used to be, linking to Filters. */
export const BlockedNote = ({
  children,
}: {
  children: string;
}): ReactElement => {
  const openPage = useOpenForYouSettingsPage();

  return (
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {children}{' '}
      <button
        type="button"
        className="underline"
        onClick={() => openPage(FeedSettingsMenu.Filters)}
      >
        Manage blocks in Filters
      </button>
    </Typography>
  );
};

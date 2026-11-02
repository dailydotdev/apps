import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../../../components/dropdown/DropdownMenu';
import type { MenuItemProps } from '../../../components/dropdown/common';
import { MenuIcon } from '../../../components/icons/Menu';
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
  <section className="flex flex-col gap-2 @container">
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
    <ul className="grid grid-cols-1 gap-x-8 @2xl:grid-cols-2">{children}</ul>
  </section>
);

export const SettingsListEmpty = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <li className="col-span-full py-2">
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </li>
);

/**
 * One topic, source or creator: who it is with its boost beside the name, a
 * note on its own line when there's something to add, and its other actions
 * in a menu.
 */
export const SettingsRow = ({
  media,
  name,
  note,
  noteClassName,
  boost,
  options,
}: {
  media?: ReactNode;
  name: string;
  note?: string;
  noteClassName?: string;
  boost?: ReactNode;
  options: MenuItemProps[];
}): ReactElement => (
  <li className="flex min-h-12 items-center gap-3 py-1.5">
    {media}
    <span className="flex min-w-0 flex-1 shrink flex-col">
      <span className="flex min-w-0 items-center gap-2">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          className="min-w-0 shrink truncate"
          bold
        >
          {name}
        </Typography>
        {boost}
      </span>
      {note && (
        <Typography
          type={TypographyType.Footnote}
          color={noteClassName ? undefined : TypographyColor.Tertiary}
          className={noteClassName}
        >
          {note}
        </Typography>
      )}
    </span>
    <DropdownMenu>
      <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<MenuIcon />}
          aria-label={`Options for ${name}`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
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

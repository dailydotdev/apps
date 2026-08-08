import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { CardIcon, CardLayout } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

const options = [
  { value: 'pane', label: 'Side pane', Icon: CardLayout },
  { value: 'modal', label: 'Modal', Icon: CardIcon },
];

const tabClass =
  'inline-flex items-center gap-1.5 rounded-8 px-2 py-1 transition-colors';

export const AgentViewToggle = ({ view }: { view: string }): ReactElement => {
  const router = useRouter();

  const onSelect = (value: string) =>
    router.replace(
      { pathname: router.pathname, query: { ...router.query, view: value } },
      undefined,
      { shallow: true },
    );

  return (
    <nav
      aria-label="Content view switch"
      className="inline-flex w-fit shrink-0 items-center gap-0.5 rounded-10 border border-border-subtlest-tertiary bg-background-default p-0.5"
    >
      {options.map(({ value, label, Icon }) => {
        const isActive = view === value;

        return (
          <button
            key={value}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(value)}
            className={classNames(
              tabClass,
              isActive
                ? 'bg-surface-active text-text-primary'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
            )}
          >
            <Icon
              size={IconSize.XSmall}
              secondary={isActive}
              className={
                isActive ? 'text-accent-cabbage-default' : 'text-text-secondary'
              }
            />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              bold
              color={
                isActive ? TypographyColor.Primary : TypographyColor.Secondary
              }
            >
              {label}
            </Typography>
          </button>
        );
      })}
    </nav>
  );
};

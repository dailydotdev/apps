import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { IconSize } from '../../../../components/Icon';
import { TerminalIcon, EditIcon, PlusIcon } from '../../../../components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';

interface StackItemProps {
  icon: ReactElement;
  name: string;
  level?: 'expert' | 'proficient' | 'hobby';
  years?: number;
}

const StackItem = ({
  icon,
  name,
  level = 'proficient',
  years,
}: StackItemProps): ReactElement => {
  const levelStyles = {
    expert: 'bg-action-upvote-float text-action-upvote-default',
    proficient: 'bg-accent-cabbage-float text-accent-cabbage-default',
    hobby: 'bg-accent-blueCheese-float text-accent-blueCheese-default',
  };

  return (
    <div className="flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 py-2 transition-colors hover:border-border-subtlest-secondary">
      <span className="text-text-tertiary">{icon}</span>
      <Typography type={TypographyType.Callout} bold className="flex-1">
        {name}
      </Typography>
      {years && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
        >
          {years}y
        </Typography>
      )}
      <span
        className={`rounded-6 px-2 py-0.5 typo-caption2 ${levelStyles[level]}`}
      >
        {level}
      </span>
    </div>
  );
};

interface HotTakeItemProps {
  icon: string;
  label: string;
  content: string;
}

const HotTakeItem = ({
  icon,
  label,
  content,
}: HotTakeItemProps): ReactElement => (
  <div className="group flex items-start gap-3">
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-8 bg-surface-float text-base">
      {icon}
    </span>
    <div className="flex flex-1 flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <Typography type={TypographyType.Callout} bold>
          {label}
        </Typography>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<EditIcon />}
          className="opacity-0 group-hover:opacity-100"
        />
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {content}
      </Typography>
    </div>
  </div>
);

export const StackDNA = (): ReactElement => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Typography type={TypographyType.Body} bold>
          Stack & Tools
        </Typography>
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<EditIcon />}
        >
          Edit
        </Button>
      </div>

      {/* Primary Stack */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Primary Stack
        </Typography>
        <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
          <StackItem
            icon={<TerminalIcon size={IconSize.Small} />}
            name="TypeScript"
            level="expert"
            years={5}
          />
          <StackItem
            icon={<TerminalIcon size={IconSize.Small} />}
            name="React"
            level="expert"
            years={6}
          />
          <StackItem
            icon={<TerminalIcon size={IconSize.Small} />}
            name="Node.js"
            level="proficient"
            years={4}
          />
          <StackItem
            icon={<TerminalIcon size={IconSize.Small} />}
            name="PostgreSQL"
            level="proficient"
            years={3}
          />
          <button
            type="button"
            className="flex items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 py-2 text-text-tertiary transition-colors hover:border-border-subtlest-secondary hover:text-text-secondary"
          >
            <PlusIcon size={IconSize.Small} />
            <span className="typo-callout">Add</span>
          </button>
        </div>
      </div>

      {/* Just for Fun */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Just for Fun
        </Typography>
        <div className="flex flex-wrap gap-2">
          <StackItem
            icon={<TerminalIcon size={IconSize.Small} />}
            name="Rust"
            level="hobby"
          />
          <StackItem
            icon={<TerminalIcon size={IconSize.Small} />}
            name="Go"
            level="hobby"
          />
          <button
            type="button"
            className="flex items-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 py-2 text-text-tertiary transition-colors hover:border-border-subtlest-secondary hover:text-text-secondary"
          >
            <PlusIcon size={IconSize.Small} />
            <span className="typo-callout">Add</span>
          </button>
        </div>
      </div>

      {/* Hot Takes */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Hot Takes
        </Typography>
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <HotTakeItem
            icon="💚"
            label="Favorite"
            content="TypeScript + React + Tailwind - the holy trinity"
          />
          <div className="h-px bg-border-subtlest-tertiary" />
          <HotTakeItem
            icon="🚫"
            label="Would Rather Not"
            content="PHP - sorry, I've moved on. Also XML configs can stay in 2010."
          />
          <div className="h-px bg-border-subtlest-tertiary" />
          <HotTakeItem
            icon="🔥"
            label="Unpopular Opinion"
            content="Vim keybindings are overrated. Fight me."
          />
          <div className="h-px bg-border-subtlest-tertiary" />
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
            className="self-start"
          >
            Add hot take
          </Button>
        </div>
      </div>
    </div>
  );
};

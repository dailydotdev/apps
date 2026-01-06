import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyType,
  TypographyTag,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { IconSize } from '../../../../components/Icon';
import {
  TerminalIcon,
  AiIcon,
  ShieldIcon,
  AppIcon,
  CodePenIcon,
} from '../../../../components/icons';

interface StackItemProps {
  icon: ReactElement;
  name: string;
  level?: 'expert' | 'proficient' | 'learning';
  years?: number;
}

const StackItem = ({
  icon,
  name,
  level = 'proficient',
  years,
}: StackItemProps): ReactElement => {
  const levelColors = {
    expert: 'text-status-success',
    proficient: 'text-brand-default',
    learning: 'text-text-quaternary',
  };

  return (
    <div className="flex items-center gap-2 rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 py-2">
      <span className="text-text-secondary">{icon}</span>
      <span className="font-medium text-text-primary typo-callout">{name}</span>
      {years && (
        <span className="text-text-quaternary typo-footnote">{years}y</span>
      )}
      <span className={`ml-auto typo-footnote ${levelColors[level]}`}>
        {level}
      </span>
    </div>
  );
};

interface PassionTagProps {
  label: string;
  icon: ReactElement;
}

const PassionTag = ({ label, icon }: PassionTagProps): ReactElement => (
  <div className="flex items-center gap-1.5 rounded-10 bg-surface-float px-3 py-1.5">
    <span className="text-text-tertiary">{icon}</span>
    <span className="text-text-secondary typo-callout">{label}</span>
  </div>
);

export const StackDNA = (): ReactElement => {
  return (
    <div className="flex flex-col gap-4 py-4">
      <Typography
        type={TypographyType.Body}
        tag={TypographyTag.H2}
        color={TypographyColor.Primary}
        bold
      >
        Stack & Tools DNA
      </Typography>

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
        </div>
      </div>

      {/* Currently Learning */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Currently Learning
        </Typography>
        <div className="flex flex-wrap gap-2">
          <StackItem
            icon={<TerminalIcon size={IconSize.Small} />}
            name="Rust"
            level="learning"
          />
          <StackItem
            icon={<TerminalIcon size={IconSize.Small} />}
            name="Go"
            level="learning"
          />
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
        <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-status-success">♥</span>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-text-primary typo-callout">
                Favorite
              </span>
              <span className="text-text-secondary typo-footnote">
                TypeScript + React + Tailwind - the holy trinity
              </span>
            </div>
          </div>
          <div className="h-px bg-border-subtlest-tertiary" />
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-status-error">✗</span>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-text-primary typo-callout">
                Would Rather Not
              </span>
              <span className="text-text-secondary typo-footnote">
                PHP - sorry, I&apos;ve moved on. Also XML configs can stay in
                2010.
              </span>
            </div>
          </div>
          <div className="h-px bg-border-subtlest-tertiary" />
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-default">★</span>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-text-primary typo-callout">
                Guilty Pleasure
              </span>
              <span className="text-text-secondary typo-footnote">
                Still write bash scripts for everything. No regrets.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Passions & Interests */}
      <div className="flex flex-col gap-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          Passions & Interests
        </Typography>
        <div className="flex flex-wrap gap-2">
          <PassionTag
            label="Design Systems"
            icon={<CodePenIcon size={IconSize.XSmall} />}
          />
          <PassionTag
            label="Performance"
            icon={<TerminalIcon size={IconSize.XSmall} />}
          />
          <PassionTag
            label="AI/ML Tooling"
            icon={<AiIcon size={IconSize.XSmall} />}
          />
          <PassionTag
            label="Security"
            icon={<ShieldIcon size={IconSize.XSmall} />}
          />
          <PassionTag
            label="Mobile Dev"
            icon={<AppIcon size={IconSize.XSmall} />}
          />
        </div>
      </div>
    </div>
  );
};

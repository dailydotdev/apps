import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  RAIL_ICON_SIZE,
  railGlyphBoxClass,
  railTabClass,
  railTabLabelClass,
} from '@dailydotdev/shared/src/components/sidebar/common';
import ExtensionProviders from '../extension/_providers';
import { users } from './data';
import type { LfgIconOption } from './icons';
import { lfgIconOptions } from './icons';
import { LfgAvatar } from './ui';

const meta: Meta = {
  title: 'Looking for group/Icon options',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const Preview = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col items-center gap-3">
    <div className="flex min-h-[6.5rem] items-center justify-center">
      {children}
    </div>
    <Typography type={TypographyType.Caption1} color={TypographyColor.Tertiary}>
      {label}
    </Typography>
  </div>
);

const RailTab = ({
  option,
  active,
}: {
  option: LfgIconOption;
  active: boolean;
}): ReactElement => {
  const Glyph = option.icon;
  return (
    <span
      className={classNames(
        railTabClass,
        '!w-[4.25rem]',
        active && '!text-text-primary bg-surface-float',
      )}
    >
      <span className={railGlyphBoxClass}>
        <Glyph secondary={active} size={RAIL_ICON_SIZE} />
      </span>
      <span className={railTabLabelClass}>LFG</span>
    </span>
  );
};

const OptionRow = ({ option }: { option: LfgIconOption }): ReactElement => {
  const Glyph = option.icon;
  return (
    <section className="flex flex-col gap-6 rounded-16 border border-border-subtlest-tertiary p-5 laptop:flex-row laptop:items-center">
      <div className="flex gap-3 laptop:w-80 laptop:shrink-0">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-16 bg-surface-float text-text-primary">
          <Glyph size={IconSize.Large} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Typography type={TypographyType.Body} bold>
              {option.name}
            </Typography>
            <span className="rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption2">
              {option.existing ? 'In the icon set' : 'Concept sketch'}
            </span>
          </div>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
          >
            {option.why}
          </Typography>
          {option.watchOut && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Watch out: {option.watchOut}
            </Typography>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-wrap items-end gap-x-10 gap-y-6">
        <Preview label="Nav tab">
          <div className="flex gap-1">
            <RailTab option={option} active={false} />
            <RailTab option={option} active />
          </div>
        </Preview>
        <Preview label="Comment avatar">
          <LfgAvatar
            user={users.lior}
            size={ProfileImageSize.Large}
            looking
            icon={option.icon}
          />
        </Preview>
        <Preview label="Small avatar">
          <LfgAvatar
            user={users.amara}
            size={ProfileImageSize.Small}
            looking
            icon={option.icon}
          />
        </Preview>
        <Preview label="Profile ribbon">
          <LfgAvatar
            user={users.jonas}
            size={ProfileImageSize.XXXLarge}
            looking
            ribbon
            icon={option.icon}
          />
        </Preview>
        <Preview label="Section label">
          <span className="flex items-center gap-1.5 font-bold text-accent-avocado-default typo-footnote">
            <Glyph size={IconSize.Size16} secondary />
            Looking for group
          </span>
        </Preview>
      </div>
    </section>
  );
};

export const Options: Story = {
  name: 'Side by side',
  render: () => (
    <ExtensionProviders>
      <div className="min-h-screen bg-background-default px-6 py-8 text-text-primary laptop:px-10">
        <div className="mx-auto flex max-w-[80rem] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Typography
              tag={TypographyTag.H1}
              type={TypographyType.Title2}
              bold
            >
              LFG icon options
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="max-w-[48rem]"
            >
              Each option where the mark shows up: the nav tab (resting and
              active), the badge on a comment avatar and on a small avatar, the
              profile ribbon, and the section label. Concepts are rough
              sketches; the chosen one gets drawn into the icon set. Flip the
              theme in the toolbar to check dark mode.
            </Typography>
          </div>
          {lfgIconOptions.map((option) => (
            <OptionRow key={option.id} option={option} />
          ))}
        </div>
      </div>
    </ExtensionProviders>
  ),
};

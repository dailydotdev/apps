import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeSection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/ThemeSection';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PreferGoogleButton } from '@dailydotdev/shared/src/components/post/preferredSources';
import { ReviewProviders } from './_providers';

type Args = { variant: 'current' | 'proposed' };

/**
 * Mirrors `SettingsSwitch` from webapp/components/layouts/SettingsLayout —
 * that package is not a Storybook dependency, so the three-line row is
 * repeated here with the real Switch and Typography it is made of.
 */
const SettingsRow = ({
  name,
  children,
  checked,
  onToggle,
}: {
  name: string;
  children: React.ReactNode;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex justify-between gap-4">
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
      className="flex-1"
    >
      {children}
    </Typography>
    <Switch
      inputId={`${name}-switch`}
      name={name}
      compact={false}
      checked={checked}
      onToggle={onToggle}
    />
  </div>
);

const Page = ({ variant }: Args) => {
  const [openNewTab, setOpenNewTab] = useState(false);
  const [sorting, setSorting] = useState(true);

  return (
    <main className="mx-auto flex h-fit min-w-0 max-w-[40rem] flex-1 flex-col rounded-16 border-border-subtlest-tertiary tablet:border">
      <h1 className="flex h-14 w-full flex-row items-center border-b border-border-subtlest-tertiary px-4 font-bold typo-body tablet:px-6 tablet:typo-title3">
        Appearance
      </h1>
      <section className="flex w-full flex-col overflow-x-hidden p-6">
        <FlexCol className="gap-6">
          <ThemeSection />
          <FlexCol className="gap-2">
            <Typography bold type={TypographyType.Subhead}>
              Preferences
            </Typography>
            <SettingsRow
              name="sorting"
              checked={sorting}
              onToggle={() => setSorting((v) => !v)}
            >
              Show feed sorting menu
            </SettingsRow>
            <SettingsRow
              name="newtab"
              checked={openNewTab}
              onToggle={() => setOpenNewTab((v) => !v)}
            >
              Open links in new tab
            </SettingsRow>
            {variant === 'proposed' && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 flex-col">
                  <Typography
                    type={TypographyType.Callout}
                    color={TypographyColor.Tertiary}
                  >
                    Preferred source on Google
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Quaternary}
                  >
                    Show daily.dev more often in Top Stories and AI Overviews.
                  </Typography>
                </div>
                <PreferGoogleButton
                  label="Add"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Primary}
                />
              </div>
            )}
          </FlexCol>
        </FlexCol>
      </section>
    </main>
  );
};

const meta: Meta<Args> = {
  title: 'Preferred Sources/Review/4. Settings: a permanent row',
  args: { variant: 'proposed' },
  argTypes: {
    variant: { control: 'radio', options: ['current', 'proposed'] },
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <ReviewProviders loggedIn>
      <div className="min-h-screen bg-background-default p-4 text-text-primary tablet:p-8">
        <Page {...args} />
      </div>
    </ReviewProviders>
  ),
};

export default meta;

export const Current: StoryObj<Args> = { args: { variant: 'current' } };
export const Proposed: StoryObj<Args> = { args: { variant: 'proposed' } };

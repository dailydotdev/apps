import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import type { ReactElement } from 'react';
import { Case, Page } from '../hero-cover/parts';
import type { ThemeChoice } from './theme';
import { SettingsPopover, ThemedHome } from './theme';

const meta: Meta = {
  title: 'GTA VI/3. Vice City theme',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const Popover = ({ initial }: { initial: ThemeChoice }): ReactElement => {
  const [theme, setTheme] = useState<ThemeChoice>(initial);
  return <SettingsPopover theme={theme} onTheme={setTheme} />;
};

export const ViceCityTheme: StoryObj = {
  name: '3. Vice City theme',
  render: () => (
    <Page
      chapter="GTA VI · 3"
      question="How does the home page join the launch without forcing it on anyone?"
      title="Vice City theme"
      goal="An opt-in theme: dark mode with the release art behind the home page's shortcuts and greeting. Nothing applies it; the reader picks VI in the settings popover's Theme row."
      metric="Readers who pick VI, and how many still have it a week later."
    >
      <Case
        title="Switching it on"
        note="The rail's bottom gear opens production's settings popover. Its Theme row gets a fourth option, VI, after dark, light and auto. Pick VI to theme the home page, any other option to turn it off. Try it here."
      >
        <ThemedHome isSettingsOpenInitially />
      </Case>

      <Case
        title="Themed"
        note="The art sits behind the shortcuts and fades into the page before the greeting, so the widgets and feed are untouched."
      >
        <ThemedHome initialTheme="viceCity" />
      </Case>

      <Case
        title="Phone"
        note="A shorter crop of the art behind the greeting. Phones pick the theme from Settings › Appearance, where ThemeSection draws the same row."
      >
        <ThemedHome
          isPhone
          width={375}
          height={760}
          columns={1}
          initialTheme="viceCity"
        />
      </Case>

      <Case
        title="The popover"
        note="ThemeSection is shared, so the VI option also shows on Settings › Appearance. Left: dark, the default. Right: VI picked."
      >
        <div className="flex flex-wrap items-start gap-10">
          <Popover initial="dark" />
          <Popover initial="viceCity" />
        </div>
      </Case>
    </Page>
  ),
};

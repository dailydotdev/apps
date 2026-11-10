import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../hero-cover/parts';
import { AppearanceCover, ThemedHome, ThemeNudge } from './theme';

const meta: Meta = {
  title: 'GTA VI/3. Vice City theme',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

export const ViceCityTheme: StoryObj = {
  name: '3. Vice City theme',
  render: () => (
    <Page
      chapter="GTA VI · 3"
      question="How does the home page join the launch without forcing it on anyone?"
      title="Vice City theme"
      goal="An opt-in home cover: the release art behind the shortcuts and the greeting. Readers turn it on from a one-time nudge or from Appearance; nothing applies it for them."
      metric="Nudge Try it rate, and readers still themed a week later."
    >
      <Case
        title="Themed"
        note="The art sits behind the shortcuts and fades into the page before the greeting, so the widgets and feed are untouched. The Vice City chip on the cover turns it off; both directions toast with Undo."
      >
        <ThemedHome initialCover="viceCity" hasNudge={false} />
      </Case>

      <Case
        title="The nudge, launch week"
        note="Default home, release week: one card beside the greeting with the art as a thumbnail. Try it applies the cover (Undo in the toast); the close button dismisses it for good. Try it here."
      >
        <ThemedHome />
      </Case>

      <Case
        title="Phone"
        note="A shorter crop of the art behind the greeting. The nudge drops under the greeting, compact; the Vice City chip sits at the top right."
      >
        <div className="flex flex-wrap items-start gap-10">
          <ThemedHome
            isPhone
            width={375}
            height={760}
            columns={1}
            initialCover="viceCity"
            hasNudge={false}
          />
          <ThemedHome isPhone width={375} height={760} columns={1} />
        </div>
      </Case>

      <Case
        title="Appearance"
        note="Settings › Appearance gets a Home cover row under Theme. Both the nudge and the cover chip write this same setting."
      >
        <div className="flex flex-wrap items-start gap-10">
          <AppearanceCover />
          <AppearanceCover initialCover="viceCity" />
        </div>
      </Case>

      <Case title="The nudge on its own">
        <div className="flex w-[25rem] flex-col gap-3">
          <ThemeNudge />
          <ThemeNudge isCompact />
        </div>
      </Case>
    </Page>
  ),
};

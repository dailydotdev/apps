import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders, { bootAsAnonymous } from '../extension/_providers';
import { Card, Page, Section, VersionShot } from './kit';
import type { Version } from './kit';
import { LaptopShell } from './chrome';
import { ExplorePage } from './pages';

// /posts is where an anonymous laptop visitor lands: `/` redirects them to
// onboarding, so Explore is their home. The screenshots in the brief are
// this page. Every frame is a real 1440×900 window; scroll inside it.

const versions: Version[] = ['before', 'today', 'proposed'];

const Comparison = ({
  width = 1440,
  height = 900,
  member = true,
}: {
  width?: number;
  height?: number;
  member?: boolean;
}): ReactElement => (
  <ExtensionProviders>
    <Page
      title="Explore, three ways"
      lead={
        <>
          The page is identical in all three. What changed on 23 October is the
          chrome around it: the v1 sidebar went, the v2 rail took its place, and
          the global header stayed. Scroll each window: the header and the
          sign-in strip are the only pieces that follow the page.
        </>
      }
    >
      <Section title="Anonymous visitor on /posts">
        <div className="flex flex-col gap-10">
          {versions.map((version) => (
            <VersionShot
              key={version}
              version={version}
              width={width}
              height={height}
            >
              <LaptopShell version={version} selected="explore" signupBanner>
                <ExplorePage version={version} />
              </LaptopShell>
            </VersionShot>
          ))}
        </div>
      </Section>
      {member && (
        <Section
          title="Signed-in reference"
          lead="The proposed shell is this one minus the account tabs, plus the sign-in strip. Same rail width, same card, same page strip, same 64px of chrome above the first card."
        >
          <VersionShot
            version="today"
            audience="member"
            width={width}
            height={height}
          >
            <LaptopShell version="today" audience="member" selected="explore">
              <ExplorePage version="today" tight />
            </LaptopShell>
          </VersionShot>
        </Section>
      )}
      <Section title="What to look at">
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
          <Card title="1 · Before">
            <p>
              One logo, one search, the auth buttons top-right. The 44px sidebar
              is icon-only with no labels and no panels; most of its rows ask a
              visitor to sign up (Get Plus, Following, History, saves).
            </p>
          </Card>
          <Card title="2 · Today" tone="warning">
            <p>
              Two logos (the rail’s is under the header), two searches (header
              pill and rail glyph), the rail’s open/close toggle hidden under
              the header, no floating card, a Streak tab whose panel needs an
              account, an Invite button that leads to a signed-in settings page.
            </p>
          </Card>
          <Card title="3 · Proposed" tone="brand">
            <p>
              The member shell, for everyone. Auth moves to a sticky sign-in
              strip above the card: Get the app, Log in and Sign up in one row,
              under a short title. The rail keeps only Explore and Squads;
              nothing on it needs an account.
            </p>
          </Card>
        </div>
      </Section>
    </Page>
  </ExtensionProviders>
);

const meta: Meta<typeof Comparison> = {
  title: 'Layout v2 anonymous/1. Explore',
  component: Comparison,
  beforeEach: bootAsAnonymous,
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<typeof Comparison>;

/** The three anonymous shells and the signed-in reference, at 1440×900. */
export const Laptop1440: Story = {
  name: '1440 × 900',
};

/** The smallest laptop that gets the rail (1020px is the breakpoint). */
export const Laptop1024: Story = {
  name: '1024 × 768',
  args: { width: 1024, height: 768 },
};

/** A wide laptop, where the signup banner no longer leaves the cookie lane. */
export const Laptop1920: Story = {
  name: '1920 × 1080',
  args: { width: 1920, height: 1080 },
};

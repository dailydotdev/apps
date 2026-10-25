import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders, { bootAsAnonymous } from '../extension/_providers';
import { Card, Page, Section, Shot } from './kit';
import { PhoneShell, TabletShell } from './chrome';
import { ExplorePage } from './pages';

// Below the laptop breakpoint neither #7017 nor the fix changes anything:
// tablets keep SidebarTablet and the page's own sticky search and tabs,
// phones keep the shell block and the bottom bar, both the same for
// visitors and members apart from the account controls. Shown so the
// review covers every width a visitor can have.

const Breakpoints = (): ReactElement => (
  <ExtensionProviders>
    <Page
      title="Tablet and phone"
      lead="Unchanged by #7017 and by the fix. The chrome below laptop never depended on login: the tablet rail and the phone block are the same for everyone, minus the account squares."
    >
      <Section
        title="Tablet · 768"
        lead="SidebarTablet (64px), CustomAuthBanner’s Log in / Sign up strip pinned to the top, then the page’s sticky search panel and its explore tabs."
      >
        <div className="flex flex-wrap gap-8">
          <Shot label="768 × 1024" width={768} height={1024}>
            <TabletShell>
              <ExplorePage version="before" count={6} />
            </TabletShell>
          </Shot>
        </div>
      </Section>
      <Section
        title="Phone · 375"
        lead="ShellBlock’s Explore row with the logged-out Log in and Open app squares (#6731), the segments, then the feed; ShellCluster’s bar at the bottom with Explore lit."
      >
        <div className="flex flex-wrap gap-8">
          <Shot label="375 × 812" width={375} height={812}>
            <PhoneShell>
              <ExplorePage version="today" count={4} />
            </PhoneShell>
          </Shot>
        </div>
      </Section>
      <Section title="Why these are out of scope">
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
          <Card title="Tablet">
            <p>
              MainLayout renders SidebarTablet below laptop whatever the login
              state, and the global header is replaced by the page’s own search
              panel on explore pages. There is no rail to duplicate it.
            </p>
          </Card>
          <Card title="Phone">
            <p>
              The phone shell (ShellBlock, ShellCluster) shipped in its own
              project and already handles visitors: account squares hide, and
              tabs that need a login (Activity, Create) open the login sheet.
            </p>
          </Card>
        </div>
      </Section>
    </Page>
  </ExtensionProviders>
);

const meta: Meta<typeof Breakpoints> = {
  title: 'Layout v2 anonymous/5. Tablet and phone',
  component: Breakpoints,
  beforeEach: bootAsAnonymous,
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<typeof Breakpoints>;

export const All: Story = { name: 'Tablet and phone' };

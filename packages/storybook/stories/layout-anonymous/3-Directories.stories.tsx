import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders, { bootAsAnonymous } from '../extension/_providers';
import { Card, Page, Section, VersionShot } from './kit';
import type { Version } from './kit';
import { LaptopShell } from './chrome';
import { SquadsPage, TagsPage } from './pages';

// The directories a visitor reaches from search engines and from the rail's
// Explore and Squads panels. /tags has no page strip at all, so the chrome
// is all that frames it; /squads/discover has a strip of its own with an
// action (New Squad) that asks a visitor to log in. /sources and /users are
// the same shell as /tags.

const versions: Version[] = ['before', 'today', 'proposed'];

const Directories = ({
  width = 1440,
  height = 900,
  page = 'tags',
}: {
  width?: number;
  height?: number;
  page?: 'tags' | 'squads';
}): ReactElement => {
  const isTags = page === 'tags';
  return (
    <ExtensionProviders>
      <Page
        title={
          isTags ? 'Tags directory, three ways' : 'Squads directory, three ways'
        }
        lead={
          isTags ? (
            <>
              /tags is a hero, a letter filter and the sections — no strip.
              Today the hero sits 64px lower than for a member and the page has
              no card; the rail beside it is the member’s, minus everything that
              needs an account.
            </>
          ) : (
            <>
              /squads/discover carries SquadDirectoryLayout’s own strip: search,
              the category tabs and New Squad. The strip already is the v2 page
              header for everyone on laptop; only the shell around it differs.
            </>
          )
        }
      >
        <Section
          title={`Anonymous visitor on ${
            isTags ? '/tags' : '/squads/discover'
          }`}
        >
          <div className="flex flex-col gap-10">
            {versions.map((version) => (
              <VersionShot
                key={version}
                version={version}
                width={width}
                height={height}
              >
                <LaptopShell
                  version={version}
                  selected={isTags ? 'explore' : 'squads'}
                  signupBanner
                >
                  {isTags ? <TagsPage /> : <SquadsPage version={version} />}
                </LaptopShell>
              </VersionShot>
            ))}
          </div>
        </Section>
        <Section title="Signed-in reference">
          <VersionShot
            version="today"
            audience="member"
            width={width}
            height={height}
          >
            <LaptopShell
              version="today"
              audience="member"
              selected={isTags ? 'explore' : 'squads'}
            >
              {isTags ? <TagsPage /> : <SquadsPage version="today" />}
            </LaptopShell>
          </VersionShot>
        </Section>
        <Section title="Notes">
          <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
            {isTags ? (
              <Card title="Which tab is lit">
                <p>
                  /tags resolves to the Explore category (its row is in the
                  Explore panel), so the compass carries the pill, as it does
                  for a member.
                </p>
              </Card>
            ) : (
              <Card title="New Squad for a visitor">
                <p>
                  The strip’s New Squad and the Squads panel’s New Squad row
                  both call openNewSquad, which shows the login modal when there
                  is no user. Unchanged by the fix; it is the right behaviour.
                </p>
              </Card>
            )}
            <Card title="The bottom banner">
              <p>
                PublicPageSignupBanner pins to the window on every directory,
                beside the rail since #7017. In the proposed shell it overlaps
                the card’s bottom corners; the card’s radius is clipped by the
                banner’s top border, which reads fine, but it is the one place
                the two surfaces meet.
              </p>
            </Card>
          </div>
        </Section>
      </Page>
    </ExtensionProviders>
  );
};

const meta: Meta<typeof Directories> = {
  title: 'Layout v2 anonymous/3. Directories',
  component: Directories,
  beforeEach: bootAsAnonymous,
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<typeof Directories>;

export const Tags: Story = {
  name: 'Tags · 1440 × 900',
  args: { page: 'tags' },
};

export const Squads: Story = {
  name: 'Squads · 1440 × 900',
  args: { page: 'squads' },
};

export const TagsLaptop1024: Story = {
  name: 'Tags · 1024 × 768',
  args: { page: 'tags', width: 1024, height: 768 },
};

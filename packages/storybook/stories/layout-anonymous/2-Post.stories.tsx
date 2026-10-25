import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders, { bootAsAnonymous } from '../extension/_providers';
import { Card, Page, Section, VersionShot } from './kit';
import type { Version } from './kit';
import { LaptopShell } from './chrome';
import { PostPage } from './pages';

// /posts/[id] is how most visitors arrive (search, shared links). It is
// also the one route whose initial HTML can carry the rail (the /layout-v2
// mirror), which today only a signed-in cookie unlocks. The post page shows
// the bottom auth banner to visitors on laptop (PostAuthBanner).

const versions: Version[] = ['before', 'today', 'proposed'];

const Comparison = ({
  width = 1440,
  height = 900,
}: {
  width?: number;
  height?: number;
}): ReactElement => (
  <ExtensionProviders>
    <Page
      title="A post, three ways"
      lead={
        <>
          The real post page (PostContent) around one of the History review’s
          posts, with the bottom auth banner the public post page pins for
          visitors. Scroll each window to the comments: in the proposed shell
          the sign-in strip stays at the top while the header is gone.
        </>
      }
    >
      <Section title="Anonymous visitor on /posts/[id]">
        <div className="flex flex-col gap-10">
          {versions.map((version) => (
            <VersionShot
              key={version}
              version={version}
              width={width}
              height={height}
            >
              <LaptopShell version={version} selected={null} signupBanner>
                <PostPage />
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
          <LaptopShell version="today" audience="member" selected={null}>
            <PostPage />
          </LaptopShell>
        </VersionShot>
      </Section>
      <Section title="Notes">
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
          <Card title="Nothing on the rail is selected">
            <p>
              A post page is no tab’s root, for members and visitors alike: the
              rail keeps whatever category you came from. Here none, as on a
              cold load from a search result.
            </p>
          </Card>
          <Card title="Server HTML">
            <p>
              Today a visitor’s hard load paints the header shell on the server
              and keeps it. With the fix a returning visitor (the cookie now
              records “laptop”) gets the mirrored route with the rail in the
              HTML; a first-ever visit hydrates from the header shell to the
              rail, as a signed-in hard load of /tags does today.
            </p>
          </Card>
        </div>
      </Section>
    </Page>
  </ExtensionProviders>
);

const meta: Meta<typeof Comparison> = {
  title: 'Layout v2 anonymous/2. Post page',
  component: Comparison,
  beforeEach: bootAsAnonymous,
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj<typeof Comparison>;

export const Laptop1440: Story = { name: '1440 × 900' };

export const Laptop1024: Story = {
  name: '1024 × 768',
  args: { width: 1024, height: 768 },
};

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bullets,
  CodeBlock,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
  SpecTable,
} from '../open-graph/ogStoryLayout';

const Mechanism = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Google Preferred Sources · 1"
      title="How it actually works, and the four gotchas that shape our build"
    >
      Everything below is from Google’s Search Central documentation for
      publishers, checked against how our webapp is actually put together. The
      gotchas are the reason we cannot use the copy-paste snippet Google leads
      with.
    </PageHeader>

    <Heading badge="route 1">
      The official button — adds the hosting domain
    </Heading>
    <Muted>
      Google’s headline integration is two lines. It renders a localised,
      Google-styled button that adds the current site and returns the reader to
      the page they were on.
    </Muted>
    <CodeBlock>{`<!-- in <head> -->
<script async src="https://news.google.com/swg/js/v1/publisher.js"></script>

<!-- anywhere in the body -->
<div google-add-preferred-source-btn data-theme="dark" data-lang="en"></div>`}</CodeBlock>
    <Muted>
      <code>data-theme</code> takes <code>light</code> (default) or{' '}
      <code>dark</code>; <code>data-lang</code> overrides the auto-detected
      language. There is no attribute for <em>which</em> domain to add — the
      script reads the origin it is running on.
    </Muted>

    <Heading badge="route 2">The deeplink — adds any domain</Heading>
    <Muted>
      A plain URL into Google’s source preferences tool. No script, no iframe,
      no third-party bytes, and the <code>q</code> parameter takes any eligible
      host.
    </Muted>
    <CodeBlock>{`https://www.google.com/preferences/source?q=towardsdatascience.com`}</CodeBlock>
    <Muted>
      This is the only route that can express “prefer the publisher of this
      post” from a daily.dev page. It costs a tab switch instead of an in-page
      confirmation — the one real downside versus the script.
    </Muted>

    <Divider />

    <Heading>The four gotchas</Heading>

    <SpecTable
      columns={['Gotcha', 'What breaks', 'What we do instead']}
      rows={[
        [
          'The auto-scan runs once, at script load',
          'The webapp reaches every post page by client-side routing, long after any <head> script has run. An empty <div google-add-preferred-source-btn> mounted by React is never scanned, so nothing renders.',
          'Load with preferred-sources-control="manual" and drive it from the PREFERRED_SOURCE callback queue, calling addPreferredSource() from our own click handler.',
        ],
        [
          'The rendered button is an iframe — one per embed',
          'It cannot inherit our tokens, typography or radii, it will not match the buttons beside it, and it reserves no space until it loads, so it shifts the sidebar.',
          'Use the advanced JS API with our own <Button> and the GoogleIcon we already ship. Google supplies translated badge assets for exactly this case.',
        ],
        [
          'Theme is set at init, not reactively',
          'A reader toggling dark mode leaves a light Google button sitting in a dark sidebar, because the iframe does not re-theme itself.',
          'Resolve ThemeMode from SettingsContext (including Auto via prefers-color-scheme) and pass it into init; re-init when it changes.',
        ],
        [
          'Only domain and subdomain level sites are eligible',
          'example.com and blog.example.com qualify; example.com/blog does not. Squad posts, user posts and polls have no publisher domain at all.',
          'normalizePreferredSourceDomain() strips www., rejects anything path-bearing or non-hostname, and the component renders null rather than linking somewhere Google will reject.',
        ],
      ]}
    />

    <Heading>What we would add to the app</Heading>
    <CodeBlock>{`// manual mode — the only mode that survives client-side routing
<script async preferred-sources-control="manual"
  src="https://news.google.com/swg/js/v1/publisher.js"></script>

(self.PREFERRED_SOURCE = self.PREFERRED_SOURCE || []).push((preferredSource) => {
  preferredSource.init({ theme: 'dark', lang: 'en' });
  // bound to our own Button, not Google's iframe
  button.addEventListener('click', () => preferredSource.addPreferredSource());
});`}</CodeBlock>
    <Muted>
      In this branch that lives in{' '}
      <code>packages/shared/src/hooks/useGooglePreferredSource.ts</code>, which
      injects the script on mount rather than from <code>&lt;head&gt;</code> — a
      post page that never shows the widget never pays for the request.
    </Muted>

    <Divider />

    <Heading badge="verified in this branch">
      What the script does when you actually load it
    </Heading>
    <Muted>
      Story 2 runs the real integration, so this is observed rather than
      inferred. The manual callback queue does fire and does enable our own
      button — the approach works. It also does one thing the documentation does
      not mention:
    </Muted>
    <CodeBlock>{`<iframe src="https://news.google.com/swg/ui/v1/serviceiframe?..."
        width="1" height="1">  <!-- appended to <body> -->`}</CodeBlock>
    <Muted>
      A 1×1 service iframe, added on every page that mounts the widget, even
      though we render no Google button of our own. That is a third-party frame
      from news.google.com on a post page — worth a look from whoever owns our
      consent posture before option A ships, and another reason to start with
      the deeplink, which loads nothing.
    </Muted>

    <Divider />

    <Heading>Two things that are easy to get wrong</Heading>
    <Bullets
      tone="bad"
      items={[
        'It requires a signed-in Google account. A meaningful share of our users signed up with GitHub, and they will hit a Google sign-in wall. The copy should not promise “one tap”.',
        'Eligibility is not automatic — a site has to appear in Google’s source preferences tool. Before we build option A we should confirm daily.dev actually resolves there, because the whole option is moot if it does not.',
      ]}
    />
    <Bullets
      tone="good"
      items={[
        'The webapp sets no Content-Security-Policy, so news.google.com needs no allowlisting work.',
        'The deeplink route adds zero third-party JavaScript to a page we have spent a lot of effort making fast.',
      ]}
    />
  </Page>
);

const meta: Meta<typeof Mechanism> = {
  title: 'Preferred Sources/1. How It Actually Works',
  component: Mechanism,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj<typeof Mechanism> = { name: 'How It Works' };

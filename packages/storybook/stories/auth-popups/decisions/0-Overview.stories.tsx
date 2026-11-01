import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CompareTable, Page, Section } from '../kit';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Still to decide/0. Overview',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => (
    <Page
      eyebrow="Auth Pop-ups · What this PR leaves open"
      title="Still to decide"
      goal={
        <>
          <p>
            <strong>Goal:</strong> settle the last differences between the
            webapp and the landing page. Each item has its own page with the
            options mocked side by side at the pop-up’s real size, and a
            recommendation.
          </p>
          <p className="mt-2">
            The mocks are built from the real buttons, icons and colors, but
            they aren’t the live components: the variant pages show those.
          </p>
        </>
      }
    >
      <Section title="Recommendations">
        <CompareTable
          firstColumn="Item"
          columns={['Recommendation', 'Where the work lands']}
          rows={[
            {
              aspect: '1. Provider list',
              cells: [
                'Sign up: Google, GitHub and email, plus Apple in the iOS app. Log in: all four providers.',
                'This repo, after checking Apple and Facebook’s share of new sign-ups',
              ],
            },
            {
              aspect: '2. Button hierarchy',
              cells: [
                'Google leads in white, the other options outlined, like the landing page',
                'This repo',
              ],
            },
            {
              aspect: '3. Title',
              cells: [
                'Decided: the header bar, with the landing headline under it on Sign up. Full pages keep a centered title.',
                'Built here. Landing PR adds the bar.',
              ],
            },
            {
              aspect: '4. Log in on the landing page',
              cells: [
                'Keep the hand-off to the full page, which now matches the pop-up',
                'Nothing to build',
              ],
            },
            {
              aspect: '5. Legal line',
              cells: [
                'Decided: Sign up only. Confirm with legal that new accounts made from Log in’s social buttons are covered.',
                'Nothing to build',
              ],
            },
            {
              aspect: '6. Phone layout',
              cells: [
                'Decided: keep today’s layouts. The landing stays a card on phones, the webapp stays full screen. The landing’s desktop card can still match 400px and the primary background.',
                'Landing PR, desktop only',
              ],
            },
            {
              aspect: '7. Security check',
              cells: [
                'Decided and built: the box shows only after someone uses the email and password form, and only if Cloudflare needs a click',
                'Done in this PR',
              ],
            },
          ]}
        />
      </Section>
      <p className="text-text-tertiary typo-footnote">
        Settled since the first review: Google One Tap stays on Sign up and Log
        in and closes once someone picks email (see Design rules).
      </p>
    </Page>
  ),
};

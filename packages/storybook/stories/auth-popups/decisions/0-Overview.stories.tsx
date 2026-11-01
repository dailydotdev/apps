import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CompareTable, Page, Section } from '../kit';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Decisions/0. Overview',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => (
    <Page
      eyebrow="Auth Pop-ups · All seven open questions, now decided"
      title="Decisions"
      goal={
        <>
          <p>
            <strong>Goal:</strong> one place for what was settled between the
            webapp and the landing page. Each item keeps its page with the
            options mocked side by side at the pop-up’s real size.
          </p>
          <p className="mt-2">
            The mocks are built from the real buttons, icons and colors, but
            they aren’t the live components: the variant pages show those.
          </p>
        </>
      }
    >
      <Section title="Decided">
        <CompareTable
          firstColumn="Item"
          columns={['Decision', 'Where the work lands']}
          rows={[
            {
              aspect: '1. Provider list',
              cells: [
                'Keep today’s list: Google, GitHub, Apple and Facebook on every pop-up, plus email',
                'Nothing to build',
              ],
            },
            {
              aspect: '2. Button hierarchy',
              cells: [
                'Keep today’s pop-up: every provider button white',
                'Nothing to build',
              ],
            },
            {
              aspect: '3. Title',
              cells: [
                'The header bar, with the landing headline under it on Sign up. Full pages keep a centered title.',
                'Built here. The landing PR adds the bar.',
              ],
            },
            {
              aspect: '4. Log in on the landing page',
              cells: [
                'Keep today’s hand-off to the full log-in page',
                'Nothing to build. An after_auth link stays an option for later.',
              ],
            },
            {
              aspect: '5. Legal line',
              cells: [
                'Sign up only. Confirm with legal that new accounts made from Log in’s social buttons are covered.',
                'Built here',
              ],
            },
            {
              aspect: '6. Phone layout',
              cells: [
                'Keep today’s layouts. The landing stays a card on phones, the webapp stays full screen.',
                'Nothing to build. The landing’s desktop card can still match 400px and the primary background.',
              ],
            },
            {
              aspect: '7. Security check',
              cells: [
                'The box shows only after someone uses the email and password form, and only if Cloudflare needs a click',
                'Built here',
              ],
            },
          ]}
        />
      </Section>
      <p className="text-text-tertiary typo-footnote">
        Also settled since the first review: Google One Tap stays on Sign up and
        Log in and closes once someone picks email (see Design rules).
      </p>
    </Page>
  ),
};

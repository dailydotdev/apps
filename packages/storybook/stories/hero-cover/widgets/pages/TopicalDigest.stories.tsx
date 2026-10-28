import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { headlines, HeadlinesWidget } from '../headlines';
import { StateRow } from '../review';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Topical digest',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const TopicalDigest: StoryObj = {
  name: 'Topical digest',
  render: () => (
    <WidgetPage
      title="Topical digest"
      kinds={[
        {
          kind: 'digest',
          label: 'Every topic you follow',
          note: 'The Headlines list from the Your Daily page (#6194): one story per topic digest, the topic as a colored eyebrow over a bold title, hairlines between rows, no images and no numbers. Large adds the one-line summary the page showed when a row opened. The gear manages topics, like the page’s Headlines settings.',
        },
      ]}
    >
      <StateRow
        title="With today’s brief (Plus)"
        note="A Plus reader subscribed to briefings gets their brief as the first row, in the brief’s own voice, as the Daily page did."
        render={(size) => <HeadlinesWidget size={size} hasBrief />}
      />
      <StateRow
        title="Two topics"
        note="A reader who follows two topics sees two rows, nothing padded."
        render={(size) => (
          <HeadlinesWidget size={size} items={headlines.slice(0, 2)} />
        )}
      />
      <StateRow
        title="No headlines yet"
        note="No topics chosen, or nothing published today: the ask to choose topics, from the page’s own empty state."
        render={(size) => <HeadlinesWidget size={size} items={[]} />}
      />
    </WidgetPage>
  ),
};

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { squadPosts, SquadUpdatesWidget } from '../production';
import { StateRow } from '../review';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Squad updates',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const SquadUpdates: StoryObj = {
  name: 'Squad updates',
  render: () => (
    <WidgetPage
      title="Squad updates"
      kinds={[
        {
          kind: 'squads',
          label: 'A busy squad',
          note: 'The real AI squad (30.5K members) with its own cover, avatar and this week’s posts: who posted, when, and the post image.',
        },
      ]}
    >
      <StateRow
        title="Two posts"
        note="A small squad: the two posts it has, nothing padded around them."
        render={(size) => (
          <SquadUpdatesWidget size={size} posts={squadPosts.slice(0, 2)} />
        )}
      />
      <StateRow
        title="One post"
        render={(size) => (
          <SquadUpdatesWidget size={size} posts={squadPosts.slice(0, 1)} />
        )}
      />
      <StateRow
        title="Nothing this week"
        note="An invitation to post instead of an empty list, with the reach that makes it worth it."
        render={(size) => <SquadUpdatesWidget size={size} posts={[]} />}
      />
    </WidgetPage>
  ),
};

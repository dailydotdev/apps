import type { Meta, StoryObj } from '@storybook/react';
import { HttpResponse, http } from 'msw';
import ExtensionProviders from './_providers';
import { Boot, BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { Alerts } from '@dailydotdev/shared/src/graphql/alerts';
import { RemoteSettings } from '@dailydotdev/shared/src/graphql/settings';
import { ChecklistViewState } from '@dailydotdev/shared/src/lib/checklist';
import ShortcutLinks from 'extension/src/newtab/ShortcutLinks/ShortcutLinks';
import { ShortcutLinksUIV1 } from 'extension/src/newtab/ShortcutLinks/experiments/ShortcutLinksUIV1';
import { useState } from 'react';

const meta: Meta<typeof ShortcutLinks> = {
  title: 'Extension/ShortcutLinks',
  component: ShortcutLinks,
  args: {
    shouldUseListFeedLayout: true,
  },
  render: (args) => {
    return (
      <ExtensionProviders>
        <ShortcutLinks {...args} />
      </ExtensionProviders>
    );
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutLinks>;

export const ListFeedLayout: Story = {
  args: {
    shouldUseListFeedLayout: true,
  },
};

export const GridFeedLayout: Story = {
  ...ListFeedLayout,
  args: {
    shouldUseListFeedLayout: false,
  },
};

export const ExperimentV1: Story = {
  render: (args) => {
    const [showTopSites, setShowTopSites] = useState(true);
    const innerProps = {
      onLinkClick: () => {
        alert('onLinkClick');
      },
      onMenuClick: () => {
        alert('onMenuClick');
      },
      onOptionsOpen: () => {
        alert('onOptionsOpen');
      },
      onV1Hide: () => {
        alert('onV1Hide');
      },
      shortcutLinks: [],
      shouldUseListFeedLayout: args.shouldUseListFeedLayout,
      showTopSites,
      toggleShowTopSites: () => setShowTopSites(!showTopSites),
      hasCheckedPermission: true,
    };
    return (
      <ExtensionProviders>
        <div className={'mb-10'}>
          <small>
            this is a mock ShortcutLinks with experiment v1, care because we
            don't have interactivity with this story. You can check how modal
            works in other stories.
          </small>
          <hr />
        </div>
        <div>
          <ShortcutLinksUIV1 {...innerProps} />
        </div>
      </ExtensionProviders>
    );
  },
};

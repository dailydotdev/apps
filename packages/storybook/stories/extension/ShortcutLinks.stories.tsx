import type { Meta, StoryObj } from '@storybook/react';
import ExtensionProviders from './_providers';
import ShortcutLinks from 'extension/src/newtab/ShortcutLinks/ShortcutLinks';
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

export const Default: Story = {
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
          <p className="p-4 typo-caption1 font-medium border border-border-subtlest-tertiary">
            Be careful because this component is made to work within the
            extension and some feature could not be working as intended.
          </p>
        </div>
        <div id="__next">
          <ShortcutLinks {...innerProps} />
        </div>
      </ExtensionProviders>
    );
  },
};

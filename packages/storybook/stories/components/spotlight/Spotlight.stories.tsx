import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spotlight } from '@dailydotdev/shared/src/components/spotlight/Spotlight';
import {
  SpotlightProvider,
  SpotlightContext,
} from '@dailydotdev/shared/src/components/spotlight/SpotlightContext';
import { useSpotlight } from '@dailydotdev/shared/src/components/spotlight/useSpotlight';
import { SpotlightTrigger } from '@dailydotdev/shared/src/components/spotlight/SpotlightTrigger';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  RECENT_MAX_ENTRIES,
  RECENT_STORAGE_KEY,
} from '@dailydotdev/shared/src/components/spotlight/types';
import ExtensionProviders from '../../extension/_providers';

const meta: Meta = {
  title: 'Components/Spotlight',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const Trigger = () => {
  const { open } = useSpotlight();
  return (
    <div className="flex min-h-screen items-start justify-center bg-background-default p-8">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h1 className="typo-title2 font-bold text-text-primary">
          Spotlight playground
        </h1>
        <p className="typo-callout text-text-tertiary">
          Press <kbd>⌘</kbd>+<kbd>K</kbd> or click the trigger to open.
        </p>
        <SpotlightTrigger />
        <Button type="button" onClick={open}>
          Open Spotlight
        </Button>
      </div>
    </div>
  );
};

const SeedQuery = ({ value }: { value: string }) => {
  return (
    <SpotlightContext.Consumer>
      {(ctx) => {
        if (!ctx) {
          return null;
        }
        return <SeedRunner ctx={ctx} value={value} />;
      }}
    </SpotlightContext.Consumer>
  );
};

const SeedRunner = ({
  ctx,
  value,
}: {
  ctx: NonNullable<React.ContextType<typeof SpotlightContext>>;
  value: string;
}) => {
  useEffect(() => {
    ctx.open();
    if (value) {
      ctx.setQuery(value);
    }
    return () => ctx.close();
  }, [ctx, value]);
  return null;
};

const SeedRecents = ({ ids }: { ids: string[] }) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const entries = ids.slice(0, RECENT_MAX_ENTRIES).map((id, idx) => ({
      commandId: id,
      lastUsedAt: Date.now() - idx * 1000,
    }));
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(entries));
  }, [ids]);
  return null;
};

const SpotlightHost = ({
  initialQuery,
  recents = [],
}: {
  initialQuery?: string;
  recents?: string[];
}) => {
  return (
    <ExtensionProviders>
      <SpotlightProvider>
        <SeedRecents ids={recents} />
        <Trigger />
        <SpotlightWiring initialQuery={initialQuery} />
      </SpotlightProvider>
    </ExtensionProviders>
  );
};

const SpotlightWiring = ({ initialQuery }: { initialQuery?: string }) => {
  const { isOpen, close } = useSpotlight();
  return (
    <>
      {initialQuery !== undefined && <SeedQuery value={initialQuery} />}
      <Spotlight
        isOpen={isOpen}
        onClose={close}
        showShortcutsHelp={() => {
          // Stub: in production this opens an inline help screen.
        }}
      />
    </>
  );
};

type Story = StoryObj;

export const Empty: Story = {
  render: () => <SpotlightHost initialQuery="" />,
};

export const WithRecents: Story = {
  render: () => (
    <SpotlightHost
      initialQuery=""
      recents={['nav.bookmarks', 'create.compose-text', 'settings.theme']}
    />
  ),
};

export const Filtering: Story = {
  render: () => <SpotlightHost initialQuery="bookmark" />,
};

export const NoResults: Story = {
  render: () => <SpotlightHost initialQuery="zzzznonsense" />,
};

export const DestructiveConfirm: Story = {
  render: () => <SpotlightHost initialQuery="log out" />,
};

export const TriggerOnly: Story = {
  render: () => (
    <ExtensionProviders>
      <SpotlightProvider>
        <Trigger />
      </SpotlightProvider>
    </ExtensionProviders>
  ),
};

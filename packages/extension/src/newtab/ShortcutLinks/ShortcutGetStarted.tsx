import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import {
  cloudinaryShortcutsIconsGmail,
  cloudinaryShortcutsIconsOpenai,
  cloudinaryShortcutsIconsReddit,
  cloudinaryShortcutsIconsStackoverflow,
} from '@dailydotdev/shared/src/lib/image';
import {
  DownloadIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { useShortcutsManager } from '@dailydotdev/shared/src/features/shortcuts/hooks/useShortcutsManager';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';

// Curated "dev starter pack" that drives the empty-state suggestions. Order
// matches the illustration so what the user sees is exactly what gets
// seeded when they click "Quick pick". Names are kept short so they fit
// the tile labels the moment they're added.
interface SuggestedSite {
  url: string;
  name: string;
  icon: string;
}

function buildSuggestions(githubIcon: string): SuggestedSite[] {
  return [
    { url: 'https://mail.google.com', name: 'Gmail', icon: cloudinaryShortcutsIconsGmail },
    { url: 'https://github.com', name: 'GitHub', icon: githubIcon },
    { url: 'https://reddit.com', name: 'Reddit', icon: cloudinaryShortcutsIconsReddit },
    { url: 'https://chatgpt.com', name: 'ChatGPT', icon: cloudinaryShortcutsIconsOpenai },
    { url: 'https://stackoverflow.com', name: 'Stack Overflow', icon: cloudinaryShortcutsIconsStackoverflow },
  ];
}

function SuggestedSiteButton({
  site,
  onAdd,
}: {
  site: SuggestedSite;
  onAdd: (site: SuggestedSite) => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={() => onAdd(site)}
      className="group flex flex-col items-center gap-1 rounded-12 p-1 outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default"
      aria-label={`Add ${site.name} as a shortcut`}
      title={`Add ${site.name}`}
    >
      <span className="shadow-1 mb-2 flex size-12 items-center justify-center rounded-14 bg-surface-float text-text-secondary transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <img
          src={site.icon}
          alt=""
          loading="lazy"
          className="size-6 object-contain"
        />
      </span>
      <span className="text-text-tertiary typo-caption2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none">
        + {site.name}
      </span>
    </button>
  );
}

function ShortcutItemPlaceholder({ children }: PropsWithChildren) {
  return (
    <div className="group flex flex-col items-center" aria-hidden>
      <div className="shadow-1 mb-2 flex size-12 items-center justify-center rounded-14 bg-surface-float text-text-secondary transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        {children}
      </div>
      <span className="h-2 w-10 rounded-10 bg-surface-float" />
    </div>
  );
}

interface ShortcutGetStartedProps {
  onTopSitesClick: () => void;
  onCustomLinksClick: () => void;
  onImportClick?: () => void;
}

export const ShortcutGetStarted = ({
  onTopSitesClick,
  onCustomLinksClick,
  onImportClick,
}: ShortcutGetStartedProps): ReactElement => {
  const { githubShortcut } = useThemedAsset();
  const { completeAction, checkHasCompleted } = useActions();
  const manager = useShortcutsManager();
  const { displayToast } = useToastNotification();

  const suggestions = buildSuggestions(githubShortcut);

  const markStarted = () => {
    if (!checkHasCompleted(ActionType.FirstShortcutsSession)) {
      completeAction(ActionType.FirstShortcutsSession);
    }
  };

  const completeActionThenFire = (callback?: () => void) => {
    markStarted();
    callback?.();
  };

  // Add a single suggested site without leaving the empty state. Duplicate
  // detection lives in the manager, so a user who somehow already has the
  // URL (e.g. imported earlier) gets a clear toast instead of a silent no-op.
  const addSuggestion = async (site: SuggestedSite) => {
    const result = await manager.addShortcut({
      url: site.url,
      name: site.name,
    });
    if (result.error) {
      displayToast(result.error);
      return;
    }
    markStarted();
  };

  // "Quick pick" seeds the whole starter pack in one shot. Uses the same
  // importFrom path that the browser-bookmarks importer uses so dedupe and
  // capacity handling are consistent.
  const addAllSuggestions = async () => {
    const result = await manager.importFrom(
      'topSites',
      suggestions.map((s) => ({ url: s.url, title: s.name })),
    );
    if (result.imported === 0) {
      displayToast('All these shortcuts already exist.');
      return;
    }
    markStarted();
    displayToast(`Added ${result.imported} shortcut${result.imported === 1 ? '' : 's'}.`);
  };

  return (
    <div className="bg-surface-float/40 relative mb-6 hidden flex-col gap-6 overflow-hidden rounded-16 border border-border-subtlest-tertiary px-6 py-6 mobileXL:flex laptop:items-center">
      <div className="bg-accent-cabbage-default/10 pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/10 pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl" />
      <div className="relative flex flex-col gap-2 laptop:items-center">
        <h4 className="font-bold text-text-primary typo-title3">
          Choose your most visited sites
        </h4>
        <p className="max-w-md text-text-tertiary typo-callout laptop:text-center">
          Pin the sites you hit every day. Tap a suggestion below for a
          one-click start, or add your own.
        </p>
      </div>
      <div
        className="relative flex gap-4"
        role="group"
        aria-label="Suggested shortcuts"
      >
        {suggestions.map((site) => (
          <SuggestedSiteButton
            key={site.url}
            site={site}
            onAdd={addSuggestion}
          />
        ))}
        <ShortcutItemPlaceholder>
          <PlusIcon />
        </ShortcutItemPlaceholder>
      </div>
      <div className="relative flex flex-wrap gap-3">
        <Button
          onClick={() => completeActionThenFire(onTopSitesClick)}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Float}
        >
          Skip for now
        </Button>
        {onImportClick && (
          <Button
            onClick={() => completeActionThenFire(onImportClick)}
            size={ButtonSize.Medium}
            variant={ButtonVariant.Secondary}
            icon={<DownloadIcon />}
          >
            Import
          </Button>
        )}
        <Button
          onClick={addAllSuggestions}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Secondary}
          disabled={!manager.canAdd}
        >
          Quick pick
        </Button>
        <Button
          onClick={() => completeActionThenFire(onCustomLinksClick)}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
          icon={<PlusIcon />}
        >
          Add shortcuts
        </Button>
      </div>
    </div>
  );
};

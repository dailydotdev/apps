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

  const items = [
    cloudinaryShortcutsIconsGmail,
    githubShortcut,
    cloudinaryShortcutsIconsReddit,
    cloudinaryShortcutsIconsOpenai,
    cloudinaryShortcutsIconsStackoverflow,
  ];

  const completeActionThenFire = (callback?: () => void) => {
    if (!checkHasCompleted(ActionType.FirstShortcutsSession)) {
      completeAction(ActionType.FirstShortcutsSession);
    }
    callback?.();
  };

  return (
    <div className="bg-surface-float/40 relative mb-6 hidden flex-col gap-6 overflow-hidden rounded-16 border border-border-subtlest-tertiary px-6 py-6 tablet:flex laptop:items-center">
      <div className="bg-accent-cabbage-default/10 pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/10 pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full blur-3xl" />
      <div className="relative flex flex-col gap-2 laptop:items-center">
        <h4 className="font-bold text-text-primary typo-title3">
          Choose your most visited sites
        </h4>
        <p className="max-w-md text-text-tertiary typo-callout laptop:text-center">
          Pin the sites you hit every day. Add your own, or import from your
          browser in a click.
        </p>
      </div>
      <div className="relative flex gap-4">
        {items.map((url) => (
          <ShortcutItemPlaceholder key={url}>
            <img
              src={url}
              alt={`Icon for ${url}`}
              loading="lazy"
              className="size-6 object-contain"
            />
          </ShortcutItemPlaceholder>
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

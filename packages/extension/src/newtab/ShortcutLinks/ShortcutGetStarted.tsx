import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import {
  cloudinaryShortcutsIconsGmail,
  cloudinaryShortcutsIconsOpenai,
  cloudinaryShortcutsIconsReddit,
  cloudinaryShortcutsIconsStackoverflow,
} from '@dailydotdev/shared/src/lib/image';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import React, { PropsWithChildren } from 'react';
import { useThemedAsset } from '@dailydotdev/shared/src/hooks/utils';
import { useActions } from '@dailydotdev/shared/src/hooks';

function ShortcutItemPlaceholder({ children }: PropsWithChildren) {
  return (
    <div className="group flex flex-col items-center">
      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-surface-float text-text-secondary">
        {children}
      </div>
      <span className="h-2 w-10 rounded-10 bg-surface-float" />
    </div>
  );
}

interface ShortcutGetStartedProps {
  onTopSitesClick: () => void;
  onCustomLinksClick: () => void;
}

export const ShortcutGetStarted = ({
  onTopSitesClick,
  onCustomLinksClick,
}: ShortcutGetStartedProps) => {
  const { githubShortcut } = useThemedAsset();
  const { completeAction } = useActions();

  const items = [
    cloudinaryShortcutsIconsGmail,
    githubShortcut,
    cloudinaryShortcutsIconsReddit,
    cloudinaryShortcutsIconsOpenai,
    cloudinaryShortcutsIconsStackoverflow,
  ];

  const completeActionThenFire = (callback?: () => void) => {
    completeAction(ActionType.FirstShortcutsSession);
    callback?.();
  };

  return (
    <div className="mb-6 hidden flex-col gap-6 px-4 tablet:flex laptop:items-center">
      <h4 className="font-bold text-text-primary typo-title3">
        Choose your most visited sites
      </h4>
      <div className="flex gap-4">
        {items.map((url) => (
          <ShortcutItemPlaceholder key={url}>
            <img
              src={url}
              alt={url}
              loading="lazy"
              className="size-6 object-contain"
            />
          </ShortcutItemPlaceholder>
        ))}
        <ShortcutItemPlaceholder>
          <PlusIcon />
        </ShortcutItemPlaceholder>
      </div>
      <div className="flex gap-4">
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
          onClick={() => completeActionThenFire(onTopSitesClick)}
        >
          Skip for now
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          onClick={() => completeActionThenFire(onCustomLinksClick)}
        >
          Add shortcuts
        </Button>
      </div>
    </div>
  );
};

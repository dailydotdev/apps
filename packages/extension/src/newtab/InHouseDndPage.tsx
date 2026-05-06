import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryReadingReminderCat } from '@dailydotdev/shared/src/lib/image';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

type InHouseDndPageProps = {
  onExit: () => void;
};

export default function InHouseDndPage({
  onExit,
}: InHouseDndPageProps): ReactElement {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background-default px-6 text-center">
      <section className="flex w-full max-w-sm flex-col items-center gap-6">
        <img
          src={cloudinaryReadingReminderCat}
          alt=""
          className="h-auto w-52 max-w-full"
        />
        <h1 className="text-text-primary typo-title2">Focus mode on</h1>
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={onExit}
        >
          Exit focus mode
        </Button>
      </section>
    </main>
  );
}

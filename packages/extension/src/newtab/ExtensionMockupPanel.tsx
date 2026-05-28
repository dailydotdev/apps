import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  MiniCloseIcon,
  SettingsIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { ExtensionMockupKey } from './useExtensionMockup';
import { setExtensionMockup, useExtensionMockup } from './useExtensionMockup';

const toggles: ReadonlyArray<{
  key: ExtensionMockupKey;
  label: string;
  hint: string;
}> = [
  {
    key: 'signInStrip',
    label: 'Sign-in strip',
    hint: 'Sticky logged-out CTA at the top of the feed',
  },
  {
    key: 'reminderCard',
    label: 'Reading reminder',
    hint: 'Top hero card: enable daily reading reminder',
  },
  {
    key: 'cvCard',
    label: 'Upload CV',
    hint: 'Top hero card: upload CV for job matching',
  },
  {
    key: 'shortcutsCard',
    label: 'Shortcuts',
    hint: 'Top hero card: add new-tab shortcuts',
  },
];

export const ExtensionMockupPanel = (): ReactElement => {
  const state = useExtensionMockup();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 z-max">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<SettingsIcon />}
          onClick={() => setOpen(true)}
        >
          Mockup panel
        </Button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Mockup testing panel"
      className="fixed bottom-4 right-4 z-max w-72 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-3"
    >
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <Typography type={TypographyType.Callout} bold>
            Mockup panel
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Toggle banners for engineering review
          </Typography>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<MiniCloseIcon />}
          aria-label="Close mockup panel"
          onClick={() => setOpen(false)}
        />
      </header>
      <ul className="flex flex-col gap-3">
        {toggles.map(({ key, label, hint }) => (
          <li key={key} className="flex items-start justify-between gap-3">
            <label
              htmlFor={`mockup-${key}`}
              className="flex min-w-0 flex-1 flex-col"
            >
              <Typography type={TypographyType.Footnote} bold>
                {label}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {hint}
              </Typography>
            </label>
            <Switch
              inputId={`mockup-${key}`}
              name={`mockup-${key}`}
              checked={state[key]}
              onToggle={() => setExtensionMockup({ [key]: !state[key] })}
            />
          </li>
        ))}
      </ul>
    </aside>
  );
};

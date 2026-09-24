import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { LinkIcon, PlusIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';

// Add a product the way a profile adds a work experience: its own page,
// the title and Save in the header, one plain form in groups. The link
// comes first because it can fill in everything under it.

const pricing = ['Free', 'Freemium', 'Paid'];

const Separator = (): ReactElement => (
  <div className="h-px w-full bg-border-subtlest-tertiary" />
);

const Label = ({ children }: { children: string }): ReactElement => (
  <span className="font-bold text-text-primary typo-callout">{children}</span>
);

export const AddProductPage = (): ReactElement => {
  const [price, setPrice] = useState('Freemium');

  return (
    <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
      <div className="flex flex-col gap-2">
        <TextField
          inputId="product-link"
          name="link"
          label="Product link"
          leftIcon={<LinkIcon />}
          className={{ container: 'w-full' }}
        />
        <span className="px-1 text-text-tertiary typo-caption1">
          Paste a Product Hunt, G2, Trustpilot, GitHub or website link and we
          fill in the rest. You can edit anything after.
        </span>
      </div>
      <Separator />
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Upload logo"
          className="flex size-16 shrink-0 items-center justify-center rounded-16 bg-surface-float text-text-tertiary transition-colors hover:text-text-primary"
        >
          <PlusIcon size={IconSize.Medium} />
        </button>
        <div className="flex flex-col gap-1">
          <Label>Logo</Label>
          <span className="text-text-tertiary typo-footnote">
            Square PNG or SVG, at least 256px.
          </span>
        </div>
      </div>
      <TextField
        inputId="product-name"
        name="name"
        label="Product name*"
        placeholder="Ex: CodeRabbit CLI"
        className={{ container: 'w-full' }}
      />
      <TextField
        inputId="product-tagline"
        name="tagline"
        label="Tagline*"
        placeholder="Ex: Review your changes before you push"
        className={{ container: 'w-full' }}
      />
      <Separator />
      <TextField
        inputId="product-category"
        name="category"
        label="Category"
        placeholder="Ex: Code review"
        className={{ container: 'w-full' }}
      />
      <div className="flex flex-col gap-3">
        <Label>Pricing</Label>
        <div className="flex flex-wrap gap-2">
          {pricing.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={price === option}
              onClick={() => setPrice(option)}
              className={classNames(
                'rounded-[999px] border px-4 py-1.5 typo-callout transition-colors',
                price === option
                  ? 'border-text-primary font-bold text-text-primary'
                  : 'border-border-subtlest-tertiary text-text-tertiary hover:text-text-primary',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <Separator />
      <Textarea
        inputId="product-description"
        name="description"
        label="Description"
        hint="(optional)"
        rows={4}
      />
    </div>
  );
};

export const SaveProductButton = ({
  onSave,
}: {
  onSave: () => void;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Primary}
    size={ButtonSize.Small}
    onClick={onSave}
  >
    Save
  </Button>
);

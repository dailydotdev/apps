import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import Textarea from '@dailydotdev/shared/src/components/fields/Textarea';
import { Dropdown } from '@dailydotdev/shared/src/components/fields/Dropdown';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { HorizontalSeparator } from '@dailydotdev/shared/src/components/utilities/common';
import { profileSecondaryFieldStyles } from '@dailydotdev/shared/src/features/profile/common';
import { ImageActions } from './workspace';

// Add a product the way a profile adds a work experience: its own page,
// the title and Save in the header, one plain form in groups. The link
// comes first because it can fill in everything under it.

const pricing = ['Free', 'Freemium', 'Paid'];
const categories = [
  'Code review',
  'Developer productivity',
  'CLI',
  'IDE extension',
  'Integrations',
];

const Label = ({ children }: { children: string }): ReactElement => (
  <Typography type={TypographyType.Callout} bold>
    {children}
  </Typography>
);

export const AddProductPage = (): ReactElement => {
  const [price, setPrice] = useState('Freemium');
  const [category, setCategory] = useState(-1);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
      <div className="flex flex-col gap-2">
        <TextField
          inputId="product-link"
          name="link"
          label="Product link"
          type="url"
          placeholder="Paste a URL (e.g., producthunt.com/products/coderabbit)"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Paste a Product Hunt, G2, Trustpilot, GitHub or website link and we
          fill in the rest. You can edit anything after.
        </Typography>
      </div>
      <HorizontalSeparator />
      <div className="flex items-center gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-16 bg-surface-float">
          <ImageActions
            label="logo"
            removable={false}
            className="absolute inset-0 items-center justify-center"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Logo</Label>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Square PNG or SVG, at least 256px.
          </Typography>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <TextField
          inputId="product-name"
          name="name"
          label="Product name*"
          placeholder="Ex: CodeRabbit CLI"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <TextField
          inputId="product-tagline"
          name="tagline"
          label="Tagline*"
          placeholder="Ex: Review your changes before you push"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <Label>Category</Label>
        <Dropdown
          placeholder="Select category"
          buttonSize={ButtonSize.Large}
          options={categories}
          selectedIndex={category}
          onChange={(_, index) => setCategory(index)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Pricing</Label>
        <Radio
          name="product-pricing"
          value={price}
          onChange={setPrice}
          className={{ container: '!flex-row !gap-4' }}
          options={pricing.map((option) => ({ value: option, label: option }))}
        />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <Label>Description</Label>
        <Textarea
          inputId="product-description"
          name="description"
          label="What it does, who it is for"
          rows={6}
          maxLength={500}
        />
      </div>
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

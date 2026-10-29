import type { FormEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import type { Squad } from '../../../../graphql/sources';
import type { SquadProduct } from '../../../../graphql/squadProducts';
import {
  SquadProductPricing,
  squadProductPricingLabel,
} from '../../../../graphql/squadProducts';
import {
  SQUAD_LINK_MAX_LENGTH,
  SQUAD_PRODUCT_DESCRIPTION_MAX_LENGTH,
  SQUAD_PRODUCT_NAME_MAX_LENGTH,
  SQUAD_PRODUCT_TAGLINE_MAX_LENGTH,
} from '../../lib/limits';
import { TextField } from '../../../../components/fields/TextField';
import Textarea from '../../../../components/fields/Textarea';
import { Radio } from '../../../../components/fields/Radio';
import {
  Button,
  ButtonColor,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { CameraIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { useFileInput } from '../../../../hooks/utils/useFileInput';
import { usePrompt } from '../../../../hooks/usePrompt';
import { acceptedTypesList, ACCEPTED_TYPES } from '../../../../graphql/posts';
import { isValidSquadLink } from '../../lib/links';
import {
  isSquadProductConflict,
  squadProductConflictCopy,
  useSquadProductMutations,
} from '../../hooks/useSquadProductMutations';
import { SquadProductLogo } from './SquadProductLogo';

const LOGO_SIZE_LIMIT_MB = 1;

interface SquadProductFormProps {
  squad: Squad;
  formId: string;
  product?: SquadProduct;
  onDone: () => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const pricingOptions = Object.values(SquadProductPricing).map((value) => ({
  value,
  label: squadProductPricingLabel[value],
}));

const Label = ({ children }: { children: string }): ReactElement => (
  <Typography type={TypographyType.Callout} bold>
    {children}
  </Typography>
);

const Helper = ({ children }: { children: string }): ReactElement => (
  <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
    {children}
  </Typography>
);

export const SquadProductForm = ({
  squad,
  formId,
  product,
  onDone,
  onSavingChange,
}: SquadProductFormProps): ReactElement => {
  const isEditing = !!product;
  const { onAdd, onUpdate, onRemove, isRemoving } =
    useSquadProductMutations(squad);
  const { showPrompt } = usePrompt();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<{ file: File; preview: string }>();
  const [name, setName] = useState(product?.title ?? '');
  const [tagline, setTagline] = useState(product?.tagline ?? '');
  const [pricing, setPricing] = useState<SquadProductPricing | undefined>(
    product?.pricingModel ?? undefined,
  );
  const [description, setDescription] = useState(product?.description ?? '');
  const [website, setWebsite] = useState(product?.url ?? '');
  const [showErrors, setShowErrors] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const { onFileChange } = useFileInput({
    limitMb: LOGO_SIZE_LIMIT_MB,
    acceptedTypes: acceptedTypesList,
    onChange: (preview, file) => setLogo({ file, preview }),
  });

  const trimmedWebsite = website.trim();
  const isWebsiteValid = !trimmedWebsite || isValidSquadLink(trimmedWebsite);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);

    if (!name.trim() || !tagline.trim() || !isWebsiteValid) {
      return;
    }

    const input = {
      tagline: tagline.trim(),
      pricingModel: pricing ?? null,
      description: description.trim() || null,
      url: trimmedWebsite || null,
    };

    onSavingChange?.(true);

    try {
      if (isEditing) {
        await onUpdate({ id: product.id, input, logo: logo?.file });
      } else {
        await onAdd({
          input: { ...input, name: name.trim() },
          logo: logo?.file,
        });
      }
    } catch (error) {
      setIsConflict(isSquadProductConflict(error));
      return;
    } finally {
      onSavingChange?.(false);
    }

    onDone();
  };

  const onRemoveProduct = async () => {
    if (!product) {
      return;
    }

    const confirmed = await showPrompt({
      title: `Remove ${product.title}?`,
      description:
        'It leaves this Squad’s products. The tool stays in the daily.dev catalog.',
      okButton: { title: 'Remove', color: ButtonColor.Ketchup },
    });

    if (!confirmed) {
      return;
    }

    try {
      await onRemove(product.id);
    } catch {
      return;
    }

    onDone();
  };

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6 px-4 py-6 tablet:px-6"
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Upload logo"
          onClick={() => logoInputRef.current?.click()}
          className="group relative size-24 shrink-0 overflow-hidden rounded-16 bg-surface-float"
        >
          {logo ? (
            <img src={logo.preview} alt="" className="size-full object-cover" />
          ) : (
            product && (
              <SquadProductLogo product={product} className="size-full" />
            )
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-8 items-center justify-center rounded-10 bg-shadow-shadow3 text-text-primary">
              <CameraIcon size={IconSize.Medium} />
            </span>
          </span>
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0])}
        />
        <div className="flex flex-col gap-1">
          <Label>Logo</Label>
          <Helper>
            {`Square PNG or JPG, up to ${LOGO_SIZE_LIMIT_MB} MB. It replaces the logo wherever the tool appears on daily.dev.`}
          </Helper>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <TextField
          inputId="product-name"
          name="name"
          label="Product name*"
          fieldType="secondary"
          maxLength={SQUAD_PRODUCT_NAME_MAX_LENGTH}
          showMaxLength={false}
          value={name}
          valueChanged={(value) => {
            setName(value);
            setIsConflict(false);
          }}
          disabled={isEditing}
          valid={!isConflict && (!showErrors || !!name.trim())}
          hint={
            (isConflict && squadProductConflictCopy) ||
            (isEditing
              ? 'The name sets the tool page address, so it cannot be changed.'
              : undefined)
          }
        />
        <TextField
          inputId="product-tagline"
          name="tagline"
          label="Tagline*"
          fieldType="secondary"
          maxLength={SQUAD_PRODUCT_TAGLINE_MAX_LENGTH}
          value={tagline}
          valueChanged={setTagline}
          valid={!showErrors || !!tagline.trim()}
        />
      </div>
      {isEditing && !!product.category && (
        <div className="flex flex-col gap-2">
          <Label>Category</Label>
          <span className="self-start rounded-6 bg-surface-float px-1.5 py-0.5 text-text-tertiary typo-caption1">
            {product.category}
          </span>
          <Helper>Set by the daily.dev tools catalog.</Helper>
        </div>
      )}
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <Label>Pricing</Label>
        <Radio<SquadProductPricing>
          name="product-pricing"
          value={pricing}
          onChange={setPricing}
          className={{ container: 'flex-wrap !gap-4 tablet:!flex-row' }}
          options={pricingOptions}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Description</Label>
        <Textarea
          inputId="product-description"
          name="description"
          label="What it does, who it is for"
          rows={6}
          maxLength={SQUAD_PRODUCT_DESCRIPTION_MAX_LENGTH}
          value={description}
          valueChanged={setDescription}
        />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <Label>Website</Label>
        <Helper>
          Developers land here from the product’s tool page on daily.dev.
        </Helper>
        <TextField
          inputId="product-website"
          name="product-website"
          label="Website"
          type="url"
          fieldType="secondary"
          maxLength={SQUAD_LINK_MAX_LENGTH}
          showMaxLength={false}
          value={website}
          valueChanged={setWebsite}
          valid={!showErrors || isWebsiteValid}
          hint={
            showErrors && !isWebsiteValid
              ? 'Use a full address starting with https://'
              : undefined
          }
        />
      </div>
      {isEditing && (
        <>
          <HorizontalSeparator />
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            color={ButtonColor.Ketchup}
            className="self-start"
            loading={isRemoving}
            onClick={onRemoveProduct}
          >
            Remove product
          </Button>
        </>
      )}
    </form>
  );
};

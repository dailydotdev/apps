import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { TextField } from '../../../../components/fields/TextField';
import Autocomplete from '../../../../components/fields/Autocomplete';
import {
  Typography,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Dropdown } from '../../../../components/fields/Dropdown';
import Textarea from '../../../../components/fields/Textarea';
import ImageInput from '../../../../components/fields/ImageInput';
import { fallbackImages } from '../../../../lib/config';
import { locationToString } from '../../../../lib/utils';
import type { TLocation } from '../../../../graphql/autocomplete';
import type { Organization } from '../../types';
import type { OrganizationFormValues } from '../../hooks/useOrganizationEditForm';
import type { LinkItem } from '../../utils/platformDetection';
import { companySizeOptions, companyStageOptions } from '../../constants';
import { LinksInput } from '../LinksInput';
import { PerkInput } from '../PerkInput';

export type OrganizationEditFieldsProps = {
  form: UseFormReturn<OrganizationFormValues>;
  organization?: Organization | null;
  // Image handling
  shouldClearImage?: boolean;
  onImageChange?: (base64: string | null, file: File | null) => void;
  // Location autocomplete
  locationOptions?: Array<{ label: string; value: string }>;
  isLoadingLocations?: boolean;
  onLocationSearch?: (query: string) => void;
  onLocationSelect?: (value: string) => void;
  // Perks handlers
  perks: string[];
  onAddPerks: (perk: string | string[]) => void;
  onRemovePerk: (perk: string) => void;
  // Links handlers
  links: LinkItem[];
  onAddLink: (link: LinkItem) => void;
  onRemoveLink: (index: number) => void;
  onUpdateLink?: (index: number, link: LinkItem) => void;
};

export const OrganizationEditFields = ({
  form,
  organization,
  shouldClearImage = false,
  onImageChange,
  locationOptions = [],
  isLoadingLocations = false,
  onLocationSearch,
  onLocationSelect,
  perks,
  onAddPerks,
  onRemovePerk,
  links,
  onAddLink,
  onRemoveLink,
  onUpdateLink,
}: OrganizationEditFieldsProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <>
      {/* Company image */}
      <div className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Caption1} className="px-2">
          Company image
        </Typography>
        <ImageInput
          initialValue={shouldClearImage ? null : organization?.image}
          fallbackImage={fallbackImages.company}
          id="organizationImage"
          size="medium"
          onChange={onImageChange}
          closeable
          fileSizeLimitMB={5}
        />
      </div>

      {/* Company name */}
      <TextField
        {...register('name')}
        inputId="organizationName"
        label="Company name *"
        fieldType="secondary"
        maxLength={60}
        valid={!errors.name}
        hint={errors.name?.message}
        required
      />

      {/* Company website */}
      <TextField
        {...register('website')}
        type="url"
        inputId="organizationWebsite"
        label="Company website"
        placeholder="https://company.com"
        fieldType="secondary"
        valid={!errors.website}
        hint={errors.website?.message}
      />

      {/* Industry */}
      <TextField
        {...register('category')}
        type="text"
        inputId="organizationIndustry"
        label="Industry"
        placeholder="e.g., Developer Tools, FinTech, Healthcare"
        fieldType="secondary"
        valid={!errors.category}
        hint={errors.category?.message}
      />

      {/* Location */}
      <Controller
        name="externalLocationId"
        control={control}
        render={({ field }) => (
          <Autocomplete
            name="organizationLocation"
            label="Company location"
            placeholder="Search for a city or country"
            defaultValue={locationToString(
              organization?.location as TLocation | undefined,
            )}
            options={locationOptions}
            selectedValue={field.value}
            onChange={(value) => {
              onLocationSearch?.(value);
            }}
            onSelect={(value) => {
              field.onChange(value);
              onLocationSelect?.(value);
            }}
            isLoading={isLoadingLocations}
            resetOnBlur
            fieldType="secondary"
          />
        )}
      />

      {/* Founded year */}
      <TextField
        {...register('founded', {
          valueAsNumber: true,
        })}
        className={{
          container: 'max-w-32',
        }}
        type="number"
        inputId="organizationFounded"
        label="Founded year"
        placeholder="e.g., 2015"
        fieldType="secondary"
        valid={!errors.founded}
        hint={errors.founded?.message}
      />

      {/* Company size */}
      <div className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Caption1} className="px-2">
          Company size
        </Typography>
        <Controller
          name="size"
          control={control}
          render={({ field }) => {
            return (
              <Dropdown
                className={{
                  container: 'flex-1',
                  menu: 'w-[--radix-dropdown-menu-trigger-width]',
                  button: 'h-9',
                }}
                placeholder="Select company size"
                selectedIndex={field.value ? field.value - 1 : undefined}
                options={[...companySizeOptions]}
                onChange={(value) => {
                  const valueIndex = companySizeOptions.indexOf(
                    value as (typeof companySizeOptions)[number],
                  );
                  field.onChange(valueIndex + 1);
                }}
                valid={!errors.size}
                hint={errors.size?.message as string}
              />
            );
          }}
        />
      </div>

      {/* Funding stage */}
      <div className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Caption1} className="px-2">
          Funding stage
        </Typography>
        <Controller
          name="stage"
          control={control}
          render={({ field }) => {
            return (
              <Dropdown
                className={{
                  container: 'flex-1',
                  menu: 'w-[--radix-dropdown-menu-trigger-width]',
                  button: 'h-9',
                }}
                placeholder="Select funding stage"
                selectedIndex={field.value ? field.value - 1 : undefined}
                options={[...companyStageOptions]}
                onChange={(value) => {
                  const valueIndex = companyStageOptions.indexOf(
                    value as (typeof companyStageOptions)[number],
                  );
                  field.onChange(valueIndex + 1);
                }}
                valid={!errors.stage}
                hint={errors.stage?.message as string}
              />
            );
          }}
        />
      </div>

      {/* Company description */}
      <Textarea
        {...register('description')}
        inputId="organizationDescription"
        label="Company description"
        placeholder="Tell candidates about your company, culture, and mission"
        fieldType="secondary"
        maxLength={2000}
        valid={!errors.description}
        hint={errors.description?.message}
      />

      {/* Company perks */}
      <PerkInput perks={perks} onAdd={onAddPerks} onRemove={onRemovePerk} />

      {/* Company links */}
      <LinksInput
        links={links}
        onAdd={onAddLink}
        onRemove={onRemoveLink}
        onUpdate={onUpdateLink}
        error={errors.links?.message}
      />
    </>
  );
};

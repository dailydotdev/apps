import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { TextField } from '../../../fields/TextField';
import Textarea from '../../../fields/Textarea';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { KeywordSelection } from '../../../../features/opportunity/components/KeywordSelection';
import ProfileLocation from '../../../profile/ProfileLocation';
import type { TLocation } from '../../../../graphql/autocomplete';
import { LocationDataset } from '../../../../graphql/autocomplete';
import type { Opportunity } from '../../../../features/opportunity/types';
import type { OpportunitySideBySideEditFormData } from '../hooks/useOpportunityEditForm';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { PlusIcon } from '../../../icons/Plus';
import { TrashIcon } from '../../../icons/Trash';
import { IconSize } from '../../../Icon';
import { LocationType } from '../../../../features/opportunity/protobuf/util';
import { Radio } from '../../../fields/Radio';

export interface RoleInfoSectionProps {
  opportunity: Opportunity;
}

export function RoleInfoSection({
  opportunity,
}: RoleInfoSectionProps): ReactElement {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OpportunitySideBySideEditFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'locations',
  });

  const handleLocationSelect = useCallback(
    (location: TLocation | null, index: number) => {
      setValue(
        `locations.${index}.externalLocationId`,
        location?.id || undefined,
        { shouldDirty: true },
      );
      setValue(
        `locations.${index}.locationData`,
        location
          ? {
              id: location.id,
              city: location.city,
              country: location.country,
              subdivision: location.subdivision,
            }
          : null,
        { shouldDirty: true },
      );
    },
    [setValue],
  );

  const locationType = watch('locationType');

  const locationTypeOptions = [
    { label: 'Remote', value: `${LocationType.REMOTE}` },
    { label: 'Hybrid', value: `${LocationType.HYBRID}` },
    { label: 'On-site', value: `${LocationType.OFFICE}` },
  ];

  const handleAddLocation = useCallback(() => {
    append({});
  }, [append]);

  const handleRemoveLocation = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  return (
    <div className="flex flex-col gap-4">
      <div data-field-key="title">
        <TextField
          {...register('title')}
          type="text"
          inputId="opportunityTitle"
          label="Job title"
          fieldType="secondary"
          valid={!errors.title}
          hint={errors.title?.message as string}
        />
      </div>

      <div data-field-key="tldr">
        <Textarea
          {...register('tldr')}
          inputId="opportunityTldr"
          label="Role TLDR"
          fieldType="secondary"
          maxLength={480}
          valid={!errors.tldr}
          hint={errors.tldr?.message as string}
        />
      </div>

      <div data-field-key="keywords" className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Caption1}>
          Preferred tech stack
        </Typography>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          Define the tools, technologies, and languages you need.
        </Typography>
        <Controller
          name="keywords"
          control={control}
          render={({ field }) => (
            <KeywordSelection
              keywords={field.value || []}
              addKeyword={(value) => {
                field.onChange([
                  ...(field.value || []),
                  ...value.map((item) => ({ keyword: item })),
                ]);
              }}
              removeKeyword={(value) => {
                field.onChange(
                  (field.value || []).filter(
                    (item: { keyword: string }) =>
                      !value.includes(item.keyword),
                  ),
                );
              }}
              valid={!errors.keywords}
              hint={errors.keywords?.message as string}
            />
          )}
        />
      </div>

      <div data-field-key="locations" className="flex flex-col gap-3">
        <Typography bold type={TypographyType.Caption1}>
          Locations
        </Typography>
        <Radio
          name="locationType"
          options={locationTypeOptions}
          value={`${locationType}`}
          onChange={(val) =>
            setValue('locationType', Number(val), { shouldDirty: true })
          }
          className={{ container: '!flex-row' }}
        />
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="flex-1">
              <ProfileLocation
                locationName={`locations.${index}.externalLocationId`}
                dataset={LocationDataset.Internal}
                defaultValue={
                  opportunity?.locations?.[index]?.location
                    ? {
                        id: '',
                        city: opportunity.locations[index].location.city,
                        country:
                          opportunity.locations[index].location.country || '',
                        subdivision:
                          opportunity.locations[index].location.subdivision,
                      }
                    : undefined
                }
                onLocationSelect={(location) =>
                  handleLocationSelect(location, index)
                }
              />
            </div>
            {fields.length > 1 && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<TrashIcon size={IconSize.Small} />}
                onClick={() => handleRemoveLocation(index)}
                className="mt-6"
              />
            )}
          </div>
        ))}
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          icon={<PlusIcon size={IconSize.Small} />}
          onClick={handleAddLocation}
        >
          Add location
        </Button>
      </div>
    </div>
  );
}

export default RoleInfoSection;

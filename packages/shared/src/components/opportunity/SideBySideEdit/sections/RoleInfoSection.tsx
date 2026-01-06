import type { ReactElement } from 'react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField } from '../../../fields/TextField';
import Textarea from '../../../fields/Textarea';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { KeywordSelection } from '../../../../features/opportunity/components/KeywordSelection';
import ProfileLocation from '../../../profile/ProfileLocation';
import { LocationDataset } from '../../../../graphql/autocomplete';
import type { Opportunity } from '../../../../features/opportunity/types';
import type { OpportunitySideBySideEditFormData } from '../hooks/useOpportunityEditForm';

export interface RoleInfoSectionProps {
  /**
   * The opportunity being edited (for default location value)
   */
  opportunity: Opportunity;
}

/**
 * Role Info section for the side-by-side edit panel.
 * Contains: title, TLDR, keywords, location
 */
export function RoleInfoSection({
  opportunity,
}: RoleInfoSectionProps): ReactElement {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<OpportunitySideBySideEditFormData>();

  return (
    <div className="flex flex-col gap-4">
      <TextField
        {...register('title')}
        type="text"
        inputId="opportunityTitle"
        label="Job title"
        fieldType="secondary"
        valid={!errors.title}
        hint={errors.title?.message as string}
      />

      <Textarea
        {...register('tldr')}
        inputId="opportunityTldr"
        label="Role TLDR"
        fieldType="secondary"
        maxLength={480}
        valid={!errors.tldr}
        hint={errors.tldr?.message as string}
      />

      <div className="flex flex-col gap-2">
        <Typography bold type={TypographyType.Caption1}>
          Preferred tech stack*
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

      <ProfileLocation
        locationName="externalLocationId"
        typeName="locationType"
        dataset={LocationDataset.Internal}
        defaultValue={
          opportunity?.locations?.[0]?.location
            ? {
                id: '',
                city: opportunity.locations[0].location.city,
                country: opportunity.locations[0].location.country || '',
                subdivision: opportunity.locations[0].location.subdivision,
                type: opportunity.locations[0].type,
              }
            : undefined
        }
      />
    </div>
  );
}

export default RoleInfoSection;

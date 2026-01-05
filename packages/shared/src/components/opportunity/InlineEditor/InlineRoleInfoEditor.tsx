import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import classNames from 'classnames';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { editOpportunityInfoMutationOptions } from '../../../features/opportunity/mutations';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { opportunityEditInfoSchema } from '../../../lib/schema/opportunity';
import { applyZodErrorsToForm } from '../../../lib/form';
import { labels } from '../../../lib';
import { TextField } from '../../fields/TextField';
import Textarea from '../../fields/Textarea';
import { Radio } from '../../fields/Radio';
import { Dropdown } from '../../fields/Dropdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { KeywordSelection } from '../../../features/opportunity/components/KeywordSelection';
import ProfileLocation from '../../profile/ProfileLocation';
import { LocationDataset } from '../../../graphql/autocomplete';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { EditIcon } from '../../icons';
import { IconSize } from '../../Icon';

export interface InlineRoleInfoEditorProps {
  opportunityId: string;
  children: ReactNode;
}

const salaryPeriodOptions = ['Annually', 'Monthly', 'Hourly'];

const seniorityOptions = [
  'Intern',
  'Junior',
  'Mid',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'VP',
  'C-Level',
];

const roleTypeOptions = [
  { value: 0, title: 'IC' },
  { value: 0.5, title: 'Auto' },
  { value: 1, title: 'Management' },
];

export const InlineRoleInfoEditor = ({
  opportunityId,
  children,
}: InlineRoleInfoEditorProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const [isEditing, setIsEditing] = useState(false);

  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
    experimental_prefetchInRender: true,
  });

  const [, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({ id: opportunityId }),
  );

  const { mutateAsync, isPending } = useMutation({
    ...editOpportunityInfoMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);
      displayToast('Role info saved');
      setIsEditing(false);
    },
  });

  const methods = useForm({
    resolver: zodResolver(opportunityEditInfoSchema),
    defaultValues: async () => {
      const opportunityData = await promise;
      return opportunityData;
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = methods;

  // Reset form when opportunity data changes (e.g., after reimport)
  useEffect(() => {
    if (opportunity && !isEditing) {
      reset(opportunity);
    }
  }, [opportunity, reset, isEditing]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutateAsync({
        id: opportunityId,
        payload: data as z.infer<typeof opportunityEditInfoSchema>,
      });
    } catch (originalError) {
      if (
        originalError.response?.errors?.[0]?.extensions?.code ===
        ApiError.ZodValidationError
      ) {
        applyZodErrorsToForm({
          error: originalError,
          setError,
        });
      } else {
        displayToast(
          originalError.response?.errors?.[0]?.message || labels.error.generic,
        );
      }
      throw originalError;
    }
  });

  const handleEdit = useCallback(() => {
    if (opportunity) {
      reset(opportunity);
    }
    setIsEditing(true);
  }, [opportunity, reset]);

  const handleCancel = useCallback(() => {
    if (opportunity) {
      reset(opportunity);
    }
    setIsEditing(false);
  }, [opportunity, reset]);

  if (!isEditing) {
    return (
      <div className="relative">
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<EditIcon size={IconSize.Small} />}
          onClick={handleEdit}
          className="absolute right-0 top-0"
        />
        {children}
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-secondary bg-surface-float p-4">
        <TextField
          {...register('title')}
          type="text"
          inputId="opportunityTitle"
          label="Job title"
          fieldType="secondary"
          valid={!errors.title}
          hint={errors.title?.message}
        />

        <Textarea
          {...register('tldr')}
          inputId="opportunityTldr"
          label="Role TLDR"
          fieldType="secondary"
          maxLength={480}
          valid={!errors.tldr}
          hint={errors.tldr?.message}
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
            rules={{ required: 'Keywords are required' }}
            render={({ field }) => (
              <KeywordSelection
                keywords={field.value}
                addKeyword={(value) => {
                  field.onChange([
                    ...field.value,
                    ...value.map((item) => ({ keyword: item })),
                  ]);
                }}
                removeKeyword={(value) => {
                  field.onChange(
                    field.value.filter((item) => !value.includes(item.keyword)),
                  );
                }}
                valid={!errors.keywords}
                hint={errors.keywords?.message}
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

        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Employment type*
          </Typography>
          <Controller
            name="meta.employmentType"
            control={control}
            render={({ field }) => (
              <Radio
                className={{ container: 'flex-1 !flex-row flex-wrap' }}
                name={field.name}
                options={[
                  { label: 'Full-time', value: '1' },
                  { label: 'Part-time', value: '2' },
                  { label: 'Contract', value: '3' },
                ]}
                value={field.value?.toString()}
                onChange={(value) => field.onChange(value)}
                valid={!errors.meta?.employmentType}
              />
            )}
          />
        </div>

        <TextField
          {...register('meta.teamSize', { valueAsNumber: true })}
          className={{ container: 'max-w-32' }}
          type="number"
          inputId="opportunityTeamSize"
          label="Team size"
          fieldType="secondary"
          valid={!errors.meta?.teamSize}
          hint={errors.meta?.teamSize?.message}
        />

        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Salary range (USD)
          </Typography>
          {!!errors.meta?.salary && (
            <div
              role="alert"
              className={classNames(
                'mb-1 flex items-center gap-1 text-status-error typo-caption1',
              )}
            >
              {errors.meta.salary.message}
            </div>
          )}
          <div className="flex gap-4">
            <TextField
              {...register('meta.salary.min', { valueAsNumber: true })}
              className={{ container: 'flex-1' }}
              type="text"
              inputId="opportunitySalaryMin"
              label="Min Salary"
              valid={!errors.meta?.salary?.min}
              hint={errors.meta?.salary?.min?.message}
            />
            <TextField
              {...register('meta.salary.max', { valueAsNumber: true })}
              className={{ container: 'flex-1' }}
              type="text"
              inputId="opportunitySalaryMax"
              label="Max Salary"
              valid={!errors.meta?.salary?.max}
              hint={errors.meta?.salary?.max?.message}
            />
            <Controller
              name="meta.salary.period"
              control={control}
              render={({ field }) => (
                <Dropdown
                  className={{
                    container: 'flex-1',
                    menu: 'w-[--radix-dropdown-menu-trigger-width]',
                  }}
                  selectedIndex={field.value ? field.value - 1 : undefined}
                  options={salaryPeriodOptions}
                  onChange={(value) => {
                    const valueIndex = salaryPeriodOptions.indexOf(value);
                    field.onChange(valueIndex + 1);
                  }}
                  valid={!errors.meta?.salary?.period}
                  hint={errors.meta?.salary?.period?.message}
                />
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Seniority level*
          </Typography>
          <Controller
            name="meta.seniorityLevel"
            control={control}
            render={({ field }) => (
              <Dropdown
                className={{
                  container: 'flex-1',
                  menu: 'w-[--radix-dropdown-menu-trigger-width]',
                }}
                selectedIndex={field.value ? field.value - 1 : undefined}
                options={seniorityOptions}
                onChange={(value) => {
                  const valueIndex = seniorityOptions.indexOf(value);
                  field.onChange(valueIndex + 1);
                }}
                valid={!errors.meta?.seniorityLevel}
                hint={errors.meta?.seniorityLevel?.message}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Job type*
          </Typography>
          <Controller
            name="meta.roleType"
            control={control}
            render={({ field }) => (
              <Dropdown
                className={{
                  container: 'flex-1',
                  menu: 'w-[--radix-dropdown-menu-trigger-width]',
                }}
                selectedIndex={roleTypeOptions.findIndex(
                  (option) => option.value === field.value,
                )}
                options={roleTypeOptions.map((option) => option.title)}
                onChange={(value) => {
                  const item = roleTypeOptions.find(
                    (option) => option.title === value,
                  );
                  field.onChange(item?.value || 0);
                }}
                valid={!errors.meta?.roleType}
                hint={errors.meta?.roleType?.message}
              />
            )}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-border-subtlest-tertiary pt-4">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onSubmit}
            loading={isPending}
          >
            Save
          </Button>
        </div>
      </div>
    </FormProvider>
  );
};

export default InlineRoleInfoEditor;

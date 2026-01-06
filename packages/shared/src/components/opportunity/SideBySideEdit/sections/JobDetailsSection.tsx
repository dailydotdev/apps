import type { ReactElement } from 'react';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import classNames from 'classnames';
import { TextField } from '../../../fields/TextField';
import { Radio } from '../../../fields/Radio';
import { Dropdown } from '../../../fields/Dropdown';
import { Typography, TypographyType } from '../../../typography/Typography';
import type { OpportunitySideBySideEditFormData } from '../hooks/useOpportunityEditForm';

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

/**
 * Job Details section for the side-by-side edit panel.
 * Contains: employment type, seniority, team size, salary
 */
export function JobDetailsSection(): ReactElement {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<OpportunitySideBySideEditFormData>();

  return (
    <div className="flex flex-col gap-4">
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
              onChange={(value) => field.onChange(Number(value))}
              valid={!errors.meta?.employmentType}
            />
          )}
        />
        {errors.meta?.employmentType && (
          <Typography
            type={TypographyType.Caption2}
            className="text-status-error"
          >
            {errors.meta.employmentType.message as string}
          </Typography>
        )}
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
              hint={errors.meta?.seniorityLevel?.message as string}
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
                field.onChange(item?.value ?? 0);
              }}
              valid={!errors.meta?.roleType}
              hint={errors.meta?.roleType?.message as string}
            />
          )}
        />
      </div>

      <TextField
        {...register('meta.teamSize', { valueAsNumber: true })}
        className={{ container: 'max-w-32' }}
        type="number"
        inputId="opportunityTeamSize"
        label="Team size*"
        fieldType="secondary"
        valid={!errors.meta?.teamSize}
        hint={errors.meta?.teamSize?.message as string}
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
            {errors.meta.salary.message as string}
          </div>
        )}
        <div className="flex flex-col gap-3 tablet:flex-row tablet:gap-4">
          <TextField
            {...register('meta.salary.min', { valueAsNumber: true })}
            className={{ container: 'flex-1' }}
            type="number"
            inputId="opportunitySalaryMin"
            label="Min Salary"
            fieldType="secondary"
            valid={!errors.meta?.salary?.min}
            hint={errors.meta?.salary?.min?.message as string}
          />
          <TextField
            {...register('meta.salary.max', { valueAsNumber: true })}
            className={{ container: 'flex-1' }}
            type="number"
            inputId="opportunitySalaryMax"
            label="Max Salary"
            fieldType="secondary"
            valid={!errors.meta?.salary?.max}
            hint={errors.meta?.salary?.max?.message as string}
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
                hint={errors.meta?.salary?.period?.message as string}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default JobDetailsSection;

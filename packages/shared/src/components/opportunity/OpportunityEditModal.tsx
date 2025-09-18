import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../modals/common/Modal';
import { TextField } from '../fields/TextField';
import { opportunityByIdOptions } from '../../features/opportunity/queries';
import { Loader } from '../Loader';
import { Radio } from '../fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Dropdown } from '../fields/Dropdown';
import Textarea from '../fields/Textarea';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { KeywordSelection } from '../../features/opportunity/components/KeywordSelection';
import { labels } from '../../lib';
import { opportunityEditSchema } from '../../lib/schema/opportunity';

export type OpportunityEditModalProps = {
  id: string;
};

export const OpportunityEditModal = ({
  id,
  ...rest
}: OpportunityEditModalProps) => {
  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id }),
    experimental_prefetchInRender: true,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opportunityEditSchema),
    defaultValues: async () => {
      const opportunityData = await promise;

      return {
        title: opportunityData.title,
        tldr: opportunityData.tldr,
        keywords: opportunityData.keywords,
        country: opportunityData.location[0]?.country,
        city: opportunityData.location[0]?.city,
        subdivision: opportunityData.location[0]?.subdivision,
        roleLocation: opportunityData.location[0]?.type?.toString(),
        employmentType: opportunityData.meta.employmentType?.toString(),
        teamSize: opportunityData.meta.teamSize,
        salaryMin: opportunityData.meta.salary?.min,
        salaryMax: opportunityData.meta.salary?.max,
        salaryPeriod: opportunityData.meta.salary?.period,
        seniorityLevel: opportunityData.meta.seniorityLevel,
        roleType: opportunityData.meta.roleType,
      };
    },
  });

  if (!opportunity) {
    return <Loader />;
  }

  return (
    <Modal {...rest} isOpen isDrawerOnMobile>
      <Modal.Header className="flex justify-between" showCloseButton={false}>
        <Modal.Title className="typo-title3">Role description</Modal.Title>
        <div className="flex items-center gap-4">
          <Button
            type="text"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
          >
            Discard
          </Button>
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={handleSubmit(() => {
              // TODO job-upload call mutation
            })}
          >
            Save
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body className="gap-6 p-4">
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
        <div className="-mb-2 flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Preferred tech stack*
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            Define the tools, technologies, and languages you need the candidate
            to know.
          </Typography>
        </div>
        <Controller
          name="keywords"
          control={control}
          rules={{ required: labels.form.required }}
          render={({ field }) => {
            return (
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
            );
          }}
        />
        <div className="flex flex-col gap-4">
          <Typography bold type={TypographyType.Caption1} className="-mb-2">
            Role location*
          </Typography>
          <div className="flex gap-4">
            <TextField
              {...register('country')}
              className={{
                container: 'flex-1',
              }}
              defaultValue={opportunity.location[0]?.country}
              type="text"
              inputId="opportunityCountry"
              label="Country"
              valid={!errors.country}
              hint={errors.country?.message}
            />
            <TextField
              {...register('city')}
              className={{
                container: 'flex-1',
              }}
              defaultValue={opportunity.location[0]?.city}
              type="text"
              label="City"
              inputId="opportunityCity"
              valid={!errors.city}
              hint={errors.city?.message}
            />
            <TextField
              {...register('subdivision')}
              className={{
                container: 'flex-1',
              }}
              defaultValue={opportunity.location[0]?.subdivision}
              type="text"
              label="Subdivision"
              inputId="opportunitySubdivision"
              valid={!errors.subdivision}
              hint={errors.subdivision?.message}
            />
          </div>
          <Controller
            name="roleLocation"
            control={control}
            render={({ field }) => {
              return (
                <Radio
                  className={{ container: 'flex-1 !flex-row flex-wrap' }}
                  name={field.name}
                  options={[
                    { label: 'Remote', value: '1' },
                    { label: 'Office', value: '2' },
                    {
                      label: 'Hybrid',
                      value: '3',
                    },
                  ]}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Employment type*
          </Typography>
          <Controller
            name="employmentType"
            control={control}
            rules={{ required: labels.form.required }}
            render={({ field }) => {
              return (
                <Radio
                  className={{ container: 'flex-1 !flex-row flex-wrap' }}
                  name={field.name}
                  options={[
                    { label: 'Full-time', value: '1' },
                    { label: 'Part-time', value: '2' },
                    {
                      label: 'Contract',
                      value: 'Internship',
                    },
                  ]}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              );
            }}
          />
        </div>
        <TextField
          {...register('teamSize', {
            valueAsNumber: true,
          })}
          className={{
            container: 'max-w-32',
          }}
          type="number"
          inputId="opportunityTeamSize"
          label="Team size"
          fieldType="secondary"
          valid={!errors.teamSize}
          hint={errors.teamSize?.message}
        />
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Salary range*
          </Typography>
          <div className="flex gap-4">
            <TextField
              {...register('salaryMin', {
                valueAsNumber: true,
              })}
              className={{
                container: 'flex-1',
              }}
              type="text"
              inputId="opportunitySalaryMin"
              label="Min Salary"
              valid={!errors.salaryMin}
              hint={errors.salaryMin?.message}
            />
            <TextField
              {...register('salaryMax', {
                valueAsNumber: true,
              })}
              className={{
                container: 'flex-1',
              }}
              defaultValue={opportunity.meta.salary?.max}
              type="text"
              inputId="opportunitySalaryMax"
              label="Max Salary"
              valid={!errors.salaryMax}
              hint={errors.salaryMax?.message}
            />
            <Controller
              name="salaryPeriod"
              control={control}
              render={({ field }) => {
                const options = ['Annually', 'Monthly', 'Hourly'];

                return (
                  <Dropdown
                    className={{
                      container: 'flex-1',
                    }}
                    selectedIndex={field.value ? field.value - 1 : 0}
                    options={options}
                    onChange={(value) => {
                      const valueIndex = options.indexOf(value);
                      field.onChange(valueIndex + 1);
                    }}
                  />
                );
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Seniority level*
          </Typography>
          <Controller
            name="seniorityLevel"
            control={control}
            rules={{ required: labels.form.required }}
            render={({ field }) => {
              const options = [
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

              return (
                <Dropdown
                  className={{
                    container: 'flex-1',
                  }}
                  selectedIndex={field.value ? field.value - 1 : 0}
                  options={options}
                  onChange={(value) => {
                    const valueIndex = options.indexOf(value);
                    field.onChange(valueIndex + 1);
                  }}
                />
              );
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography bold type={TypographyType.Caption1}>
            Job type*
          </Typography>
          <Controller
            name="roleType"
            control={control}
            rules={{ required: labels.form.required }}
            render={({ field }) => {
              const options = [
                { value: 0, title: 'IC' },
                { value: 0.5, title: 'Auto' },
                { value: 1, title: 'Management' },
              ];

              return (
                <Dropdown
                  className={{
                    container: 'flex-1',
                  }}
                  selectedIndex={field.value ? field.value - 1 : 0}
                  options={options.map((option) => option.title)}
                  onChange={(value) => {
                    const valueIndex = options.findIndex(
                      (option) => option.title === value,
                    );
                    field.onChange(valueIndex + 1);
                  }}
                />
              );
            }}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

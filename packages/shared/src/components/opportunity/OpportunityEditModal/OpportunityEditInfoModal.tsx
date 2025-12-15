import React, { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import type z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ModalProps } from '../../modals/common/Modal';
import { Modal } from '../../modals/common/Modal';
import { TextField } from '../../fields/TextField';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { Loader } from '../../Loader';
import { Radio } from '../../fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Dropdown } from '../../fields/Dropdown';
import Textarea from '../../fields/Textarea';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { KeywordSelection } from '../../../features/opportunity/components/KeywordSelection';
import { labels } from '../../../lib';
import { opportunityEditInfoSchema } from '../../../lib/schema/opportunity';
import { editOpportunityInfoMutationOptions } from '../../../features/opportunity/mutations';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { applyZodErrorsToForm } from '../../../lib/form';
import { opportunityEditDiscardPrompt } from './common';
import { useExitConfirmation } from '../../../hooks/useExitConfirmation';
import { usePrompt } from '../../../hooks/usePrompt';
import ProfileLocation from '../../profile/ProfileLocation';

export type OpportunityEditInfoModalProps = {
  id: string;
};

export const OpportunityEditInfoModal = ({
  id,
  ...rest
}: OpportunityEditInfoModalProps & ModalProps) => {
  const { displayToast } = useToastNotification();
  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id }),
    experimental_prefetchInRender: true,
  });

  const [, updateOpportunity] = useUpdateQuery(opportunityByIdOptions({ id }));

  const { mutateAsync } = useMutation({
    ...editOpportunityInfoMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);

      rest.onRequestClose?.(null);
    },
  });

  const methods = useForm({
    resolver: zodResolver(opportunityEditInfoSchema),
    defaultValues: async () => {
      const opportunityData = await promise;

      return {
        ...opportunityData,
      };
    },
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    setError,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await mutateAsync({
        id,
        payload: data as z.infer<typeof opportunityEditInfoSchema>,
      });

      return result;
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

  const onValidateAction = useCallback(() => {
    return !isDirty;
  }, [isDirty]);

  const { showPrompt } = usePrompt();

  useExitConfirmation({
    message: labels.form.discard.description,
    onValidateAction,
  });

  const onRequestClose: ModalProps['onRequestClose'] = async (event) => {
    const shouldPrompt = !onValidateAction();

    if (shouldPrompt) {
      const shouldSave = await showPrompt(opportunityEditDiscardPrompt);

      if (shouldSave) {
        onSubmit();

        return;
      }
    }

    rest.onRequestClose?.(event);
  };

  if (!opportunity) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <Modal {...rest} isOpen onRequestClose={onRequestClose}>
        <Modal.Header className="flex justify-between" showCloseButton={false}>
          <Modal.Title className="typo-title3">Role description</Modal.Title>
          <div className="flex items-center gap-4">
            <Button
              type="text"
              variant={ButtonVariant.Subtle}
              size={ButtonSize.Small}
              onClick={onRequestClose}
            >
              Discard
            </Button>
            <Button
              type="submit"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={onSubmit}
              loading={isSubmitting}
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
              Define the tools, technologies, and languages you need the
              candidate to know.
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
                      field.value.filter(
                        (item) => !value.includes(item.keyword),
                      ),
                    );
                  }}
                  valid={!errors.keywords}
                  hint={errors.keywords?.message}
                />
              );
            }}
          />
          <div className="flex flex-col">
            <ProfileLocation
              locationName="externalLocationId"
              typeName="locationType"
              defaultValue={
                opportunity.locations?.[0]?.location
                  ? {
                      id: '',
                      city: opportunity.locations[0].location.city,
                      country: opportunity.locations[0].location.country || '',
                      subdivision:
                        opportunity.locations[0].location.subdivision,
                      type: opportunity.locations[0].type,
                    }
                  : undefined
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Typography bold type={TypographyType.Caption1}>
              Employment type*
            </Typography>
            <Controller
              name="meta.employmentType"
              control={control}
              rules={{ required: labels.form.required }}
              render={({ field }) => {
                return (
                  <Radio
                    className={{ container: 'flex-1 !flex-row flex-wrap' }}
                    name={field.name}
                    options={
                      [
                        { label: 'Full-time', value: '1' },
                        { label: 'Part-time', value: '2' },
                        {
                          label: 'Contract',
                          value: '3',
                        },
                      ] as Record<string, string>[]
                    }
                    value={field.value?.toString()}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                    valid={!errors.meta?.employmentType}
                  />
                );
              }}
            />
          </div>
          <TextField
            {...register('meta.teamSize', {
              valueAsNumber: true,
            })}
            className={{
              container: 'max-w-32',
            }}
            type="number"
            inputId="opportunityTeamSize"
            label="Team size"
            fieldType="secondary"
            valid={!errors.meta?.teamSize}
            hint={errors.meta?.teamSize?.message}
          />
          <div className="flex flex-col gap-2">
            <Typography bold type={TypographyType.Caption1}>
              Salary range
            </Typography>
            <div className="flex gap-4">
              <TextField
                {...register('meta.salary.min', {
                  valueAsNumber: true,
                })}
                className={{
                  container: 'flex-1',
                }}
                type="text"
                inputId="opportunitySalaryMin"
                label="Min Salary"
                valid={!errors.meta?.salary?.min}
                hint={errors.meta?.salary?.min?.message}
              />
              <TextField
                {...register('meta.salary.max', {
                  valueAsNumber: true,
                })}
                className={{
                  container: 'flex-1',
                }}
                defaultValue={opportunity.meta.salary?.max}
                type="text"
                inputId="opportunitySalaryMax"
                label="Max Salary"
                valid={!errors.meta?.salary?.max}
                hint={errors.meta?.salary?.max?.message}
              />
              <Controller
                name="meta.salary.period"
                control={control}
                render={({ field }) => {
                  const options = ['Annually', 'Monthly', 'Hourly'];

                  return (
                    <Dropdown
                      className={{
                        container: 'flex-1',
                      }}
                      selectedIndex={field.value ? field.value - 1 : undefined}
                      options={options}
                      onChange={(value) => {
                        const valueIndex = options.indexOf(value);
                        field.onChange(valueIndex + 1);
                      }}
                      valid={!errors.meta?.salary?.period}
                      hint={errors.meta?.salary?.period?.message}
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
              name="meta.seniorityLevel"
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
                    selectedIndex={field.value ? field.value - 1 : undefined}
                    options={options}
                    onChange={(value) => {
                      const valueIndex = options.indexOf(value);
                      field.onChange(valueIndex + 1);
                    }}
                    valid={!errors.meta?.seniorityLevel}
                    hint={errors.meta?.seniorityLevel?.message}
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
              name="meta.roleType"
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
                    selectedIndex={options.findIndex(
                      (option) => option.value === field.value,
                    )}
                    options={options.map((option) => option.title)}
                    onChange={(value) => {
                      const item = options.find(
                        (option) => option.title === value,
                      );

                      field.onChange(item?.value || 0);
                    }}
                    valid={!errors.meta?.roleType}
                    hint={errors.meta?.roleType?.message}
                  />
                );
              }}
            />
          </div>
        </Modal.Body>
      </Modal>
    </FormProvider>
  );
};

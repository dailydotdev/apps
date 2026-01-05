import type { ReactElement } from 'react';
import React, { useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import classNames from 'classnames';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { editOpportunityContentMutationOptions } from '../../../features/opportunity/mutations';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { opportunityEditContentSchema } from '../../../lib/schema/opportunity';
import type { MarkdownRef } from '../../fields/MarkdownInput';
import MarkdownInput from '../../fields/MarkdownInput';
import { applyZodErrorsToForm } from '../../../lib/form';
import { labels } from '../../../lib';
import { InlineEditor } from './InlineEditor';
import type { ContentSection } from '../../../features/opportunity/types';

export interface InlineContentEditorProps {
  opportunityId: string;
  section: ContentSection;
  title: string;
  isRequired?: boolean;
}

export const InlineContentEditor = ({
  opportunityId,
  section,
  title,
  isRequired = false,
}: InlineContentEditorProps): ReactElement => {
  const { displayToast } = useToastNotification();
  const markdownRef = useRef<MarkdownRef>();

  const { data: opportunity, promise } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
    experimental_prefetchInRender: true,
  });

  const [, updateOpportunity] = useUpdateQuery(
    opportunityByIdOptions({ id: opportunityId }),
  );

  const { mutateAsync, isPending } = useMutation({
    ...editOpportunityContentMutationOptions(),
    onSuccess: (result) => {
      updateOpportunity(result);
      displayToast(`${title} saved`);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
    setError,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(
      opportunityEditContentSchema.extend({
        content: opportunityEditContentSchema.shape.content.pick({
          [section]: true,
        }),
      }),
    ),
    defaultValues: async () => {
      const opportunityData = await promise;
      return {
        content: {
          [section]: {
            content: opportunityData?.content?.[section]?.content || '',
          },
        },
      };
    },
  });

  // Reset form when opportunity data changes
  useEffect(() => {
    if (opportunity) {
      const serverContent = opportunity.content?.[section]?.content || '';
      reset({
        content: {
          [section]: {
            content: serverContent,
          },
        },
      });
    }
  }, [opportunity, section, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await mutateAsync({
        id: opportunityId,
        payload: data as z.infer<typeof opportunityEditContentSchema>,
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

  const handleDiscard = useCallback(() => {
    if (opportunity) {
      reset({
        content: {
          [section]: {
            content: opportunity.content?.[section]?.content || '',
          },
        },
      });
      markdownRef.current?.setInput(
        opportunity.content?.[section]?.content || '',
      );
    }
  }, [opportunity, section, reset]);

  const handleRemoveSection = useCallback(async () => {
    markdownRef.current?.setInput('');
    setValue(`content.${section}.content`, '');
    await onSubmit();
  }, [setValue, section, onSubmit]);

  const hasContent = !!opportunity?.content?.[section]?.html;
  const contentPreview = hasContent
    ? 'Click to edit'
    : 'No content yet - click to add';

  return (
    <InlineEditor
      title={title}
      description={contentPreview}
      isRequired={isRequired}
      isComplete={!isRequired || hasContent}
      isDirty={isDirty}
      isSubmitting={isPending}
      onSave={onSubmit}
      onDiscard={handleDiscard}
      onRemove={hasContent ? handleRemoveSection : undefined}
      defaultExpanded={hasContent}
    >
      <Controller
        control={control}
        name={`content.${section}.content`}
        render={({ field }) => {
          const hint = errors.content?.[section]?.content?.message;
          const valid = !errors.content?.[section]?.content;

          return (
            <div className="flex flex-col gap-2">
              <MarkdownInput
                ref={markdownRef}
                allowPreview={false}
                textareaProps={{
                  name: field.name,
                  rows: 8,
                  maxLength: 2000,
                  placeholder:
                    labels.opportunity.contentFields.placeholders[section] ||
                    labels.opportunity.contentFields.placeholders.generic,
                }}
                className={{
                  container: 'flex-1',
                }}
                initialContent={field.value}
                enabledCommand={{
                  upload: false,
                  link: false,
                  mention: false,
                }}
                showMarkdownGuide={false}
                onValueUpdate={(value) => {
                  field.onChange(value);
                }}
              />
              {!!hint && (
                <div
                  role={!valid ? 'alert' : undefined}
                  className={classNames(
                    'flex items-center typo-caption1',
                    !valid ? 'text-status-error' : 'text-text-quaternary',
                  )}
                >
                  {hint}
                </div>
              )}
            </div>
          );
        }}
      />
    </InlineEditor>
  );
};

export default InlineContentEditor;

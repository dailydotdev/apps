import type { ReactElement } from 'react';
import React, { useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { opportunityByIdOptions } from '../../../features/opportunity/queries';
import { editOpportunityContentMutationOptions } from '../../../features/opportunity/mutations';
import { ApiError } from '../../../graphql/common';
import { useUpdateQuery } from '../../../hooks/useUpdateQuery';
import { useToastNotification } from '../../../hooks';
import { opportunityEditContentSchema } from '../../../lib/schema/opportunity';
import type { RichTextRef } from '../../fields/RichTextEditor';
import { applyZodErrorsToForm } from '../../../lib/form';
import { labels } from '../../../lib';
import { InlineEditor } from './InlineEditor';
import type { ContentSection } from '../../../features/opportunity/types';
import { Loader } from '../../Loader';

const RichTextEditor = dynamic(
  () =>
    import(
      /* webpackChunkName: "richTextEditor" */ '../../fields/RichTextEditor'
    ).then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <Loader />,
  },
);

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
  const richTextRef = useRef<RichTextRef>();

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
      // Use HTML for rich text editor
      return {
        content: {
          [section]: {
            content: opportunityData?.content?.[section]?.html || '',
          },
        },
      };
    },
  });

  // Reset form when opportunity data changes
  useEffect(() => {
    if (opportunity) {
      // Use HTML for rich text editor
      const serverHtml = opportunity.content?.[section]?.html || '';
      reset({
        content: {
          [section]: {
            content: serverHtml,
          },
        },
      });
      // Also update RichTextEditor's internal state
      richTextRef.current?.setContent(serverHtml);
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
      const serverHtml = opportunity.content?.[section]?.html || '';
      reset({
        content: {
          [section]: {
            content: serverHtml,
          },
        },
      });
      richTextRef.current?.setContent(serverHtml);
    }
  }, [opportunity, section, reset]);

  const handleRemoveSection = useCallback(async () => {
    richTextRef.current?.setContent('');
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
              <RichTextEditor
                ref={richTextRef}
                initialContent={field.value}
                placeholder={
                  labels.opportunity.contentFields.placeholders[section] ||
                  labels.opportunity.contentFields.placeholders.generic
                }
                maxLength={2000}
                onValueUpdate={(value) => {
                  field.onChange(value);
                }}
                className={{
                  container: 'flex-1',
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

import type { ReactElement } from 'react';
import React, { useRef, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import type { RichTextRef } from '../../../fields/RichTextEditor';
import { labels } from '../../../../lib';
import type { ContentSection as ContentSectionType } from '../../../../features/opportunity/types';
import { Loader } from '../../../Loader';
import type { OpportunitySideBySideEditFormData } from '../hooks/useOpportunityEditForm';

const RichTextEditor = dynamic(
  () =>
    import(
      /* webpackChunkName: "richTextEditor" */ '../../../fields/RichTextEditor'
    ),
  {
    ssr: false,
    loading: () => <Loader />,
  },
);

export interface ContentSectionProps {
  section: ContentSectionType;
  placeholder?: string;
  onFocus?: () => void;
}

export function ContentSection({
  section,
  placeholder,
  onFocus,
}: ContentSectionProps): ReactElement {
  const richTextRef = useRef<RichTextRef>(null);
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<OpportunitySideBySideEditFormData>();

  const currentValue = watch(`content.${section}.content`);

  useEffect(() => {
    if (
      richTextRef.current &&
      typeof richTextRef.current.setContent === 'function'
    ) {
      const editorContent = richTextRef.current.getHTML?.() || '';
      if (currentValue !== editorContent) {
        richTextRef.current.setContent(currentValue || '');
      }
    }
  }, [currentValue]);

  const fieldError = errors.content?.[section]?.content;
  const hint = fieldError?.message as string | undefined;
  const valid = !fieldError;

  return (
    <div className="flex flex-col gap-2">
      <Controller
        control={control}
        name={`content.${section}.content`}
        render={({ field }) => (
          <RichTextEditor
            ref={richTextRef}
            initialContent={field.value || ''}
            placeholder={
              placeholder ||
              labels.opportunity.contentFields.placeholders[section] ||
              labels.opportunity.contentFields.placeholders.generic
            }
            maxLength={2000}
            onValueUpdate={(value) => {
              field.onChange(value);
            }}
            onFocus={onFocus}
            className={{
              container: 'flex-1 !rounded-none !border-0 !bg-transparent',
            }}
          />
        )}
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
}

export default ContentSection;

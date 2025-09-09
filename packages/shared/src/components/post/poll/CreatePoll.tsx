import type { FormEventHandler } from 'react';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { WritePageMain } from '../freeform';
import { TextField } from '../../fields/TextField';
import { useWritePostContext } from '../../../contexts';
import { Typography, TypographyType } from '../../typography/Typography';
import { WriteFooter } from '../write';
import { Button, ButtonVariant } from '../../buttons/Button';
import { PlusIcon } from '../../icons';
import { ActionType } from '../../../graphql/actions';
import { useActions } from '../../../hooks';
import { PostType } from '../../../types';

const MAX_TITLE_LENGTH = 250;
const MAX_OPTION_LENGTH = 35;

const CreatePoll = () => {
  const {
    onSubmitForm,
    isPosting,
    draft,
    isUpdatingDraft,
    updateDraft,
    formRef: propRef,
  } = useWritePostContext();
  const formRef = useRef<HTMLFormElement>();
  useImperativeHandle(propRef, () => formRef?.current);
  const { completeAction } = useActions();

  const onAddOption = () => {
    const opts = draft?.options || [];
    updateDraft({
      ...draft,
      options: [
        ...opts,
        {
          text: '',
          order: opts.length,
        },
      ],
    });
  };

  const onUpdateTitle = (value: string) => {
    updateDraft({
      ...draft,
      title: value,
    });
  };

  const onOptionUpdate = (value: string, order: number) => {
    const newOpts = draft?.options?.map((opt, index) => {
      if (index === order) {
        return {
          ...opt,
          text: value,
        };
      }

      return opt;
    });

    updateDraft({
      ...draft,
      options: newOpts,
    });
  };

  useEffect(() => {
    if (!isUpdatingDraft && !draft?.options) {
      updateDraft({
        ...draft,
        options: [
          {
            text: '',
            order: 0,
          },
          {
            text: '',
            order: 1,
          },
        ],
        duration: 7,
      });
    }
  }, [draft, updateDraft, isUpdatingDraft]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    completeAction(ActionType.WritePost);

    onSubmitForm(
      e,
      {
        title: draft.title,
        options: draft.options.filter((option) => option.text.trim() !== ''),
        duration: draft?.duration,
        content: '',
        image: undefined,
      },
      PostType.Poll,
    );
  };

  return (
    <WritePageMain onSubmit={handleSubmit} className="gap-4" ref={formRef}>
      <TextField
        className={{ container: 'w-full' }}
        inputId="title"
        name="title"
        label="Poll Title*"
        placeholder="Give your post a title"
        required
        defaultValue={draft?.title || ''}
        onInput={(e) => onUpdateTitle(e.currentTarget.value)}
        maxLength={MAX_TITLE_LENGTH}
      />
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Body} bold>
          Poll options
        </Typography>
        {draft?.options?.map((option) => (
          <TextField
            key={option.order}
            className={{ container: 'w-full' }}
            inputId={`option-${option.order}`}
            name={`option-${option.order}`}
            label={`Option ${option.order + 1}${
              option.order <= 1 ? '*' : ' (optional)'
            }`}
            placeholder="Give your post a title"
            required={option.order <= 1}
            defaultValue={option?.text || ''}
            onInput={(e) => onOptionUpdate(e.currentTarget.value, option.order)}
            maxLength={MAX_OPTION_LENGTH}
          />
        ))}
        {draft?.options && draft?.options.length < 4 && (
          <Button
            type="button"
            icon={<PlusIcon />}
            onClick={onAddOption}
            variant={ButtonVariant.Subtle}
          >
            Add option
          </Button>
        )}
      </div>
      <WriteFooter isLoading={isPosting} isPoll />
    </WritePageMain>
  );
};

export default CreatePoll;

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField } from '../../../../../components/fields/TextField';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import Textarea from '../../../../../components/fields/Textarea';
import { useId } from 'react';

const UserProjectPublicationForm = () => {
  const { control } = useFormContext();
  const titleId = useId();
  const urlId = useId();
  const descriptionId = useId();
  const publicationDateMonthId = useId();
  const publicationDateYearId = useId();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              inputId={titleId}
              label="Title*"
              placeholder="Ex: Building Scalable Microservices"
            />
          )}
        />
        <Controller
          name="url"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              inputId={urlId}
              label="Publication URL"
              placeholder="https://example.com/article"
            />
          )}
        />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Publication Date*
          </Typography>
          <div className="flex gap-2">
            <Controller
              name="startedAtMonth"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  inputId={publicationDateMonthId}
                  placeholder="Month"
                />
              )}
            />
            <Controller
              name="startedAtYear"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  inputId={publicationDateYearId}
                  placeholder="Year"
                />
              )}
            />
          </div>
        </div>
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Callout} bold>
          Description
        </Typography>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              inputId={descriptionId}
              label="Summary, key findings, or abstract"
              placeholder="Summary, key findings, or abstract"
            />
          )}
        />
      </div>
    </div>
  );
};

export default UserProjectPublicationForm;

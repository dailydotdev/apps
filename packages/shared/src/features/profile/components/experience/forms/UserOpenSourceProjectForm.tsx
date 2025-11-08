import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField } from '../../../../../components/fields/TextField';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import Textarea from '../../../../../components/fields/Textarea';
import { Switch } from '../../../../../components/fields/Switch';
import { useId } from 'react';

const UserOpenSourceProjectForm = () => {
  const { control } = useFormContext();
  const titleId = useId();
  const urlId = useId();
  const descriptionId = useId();
  const currentId = useId();
  const startedAtMonthId = useId();
  const startedAtYearId = useId();
  const endedAtMonthId = useId();
  const endedAtYearId = useId();

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
              label="Project Name*"
              placeholder="Ex: React, Vue.js, TensorFlow"
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
              label="Repository URL"
              placeholder="https://github.com/username/repo"
            />
          )}
        />
      </div>
      <HorizontalSeparator />
      <Controller
        name="current"
        control={control}
        render={({ field }) => (
          <Switch
            {...field}
            inputId={currentId}
            checked={field.value || false}
            onToggle={() => field.onChange(!field.value)}
          >
            Active project
          </Switch>
        )}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Start date*
          </Typography>
          <div className="flex gap-2">
            <Controller
              name="startedAtMonth"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  inputId={startedAtMonthId}
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
                  inputId={startedAtYearId}
                  placeholder="Year"
                />
              )}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            End date*
          </Typography>
          <div className="flex gap-2">
            <Controller
              name="endedAtMonth"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  inputId={endedAtMonthId}
                  placeholder="Month"
                />
              )}
            />
            <Controller
              name="endedAtYear"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  inputId={endedAtYearId}
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
              label="Describe your contributions, key features, and impact"
              placeholder="Describe your contributions, key features, and impact"
            />
          )}
        />
      </div>
    </div>
  );
};

export default UserOpenSourceProjectForm;

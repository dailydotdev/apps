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

const UserVolunteeringForm = () => {
  const { control } = useFormContext();
  const titleId = useId();
  const organizationId = useId();
  const descriptionId = useId();
  const currentId = useId();
  const startedAtMonthId = useId();
  const startedAtYearId = useId();
  const endedAtMonthId = useId();
  const endedAtYearId = useId();
  const locationId = useId();

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
              label="Role*"
              placeholder="Ex: Volunteer Developer, Community Organizer"
            />
          )}
        />
        <Controller
          name="customCompanyName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              inputId={organizationId}
              label="Organization*"
              placeholder="Ex: Code for America, Free Code Camp"
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
            Current position
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
        <Controller
          name="locationId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              inputId={locationId}
              label="Location"
              placeholder="City, Country"
            />
          )}
        />
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
                label="Describe your role, responsibilities, and impact"
                placeholder="Describe your role, responsibilities, and impact"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default UserVolunteeringForm;

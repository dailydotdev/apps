import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';

const UserProjectPublicationForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Title*"
          placeholder="Ex: Building Scalable Microservices"
        />
        <ControlledTextField
          name="url"
          label="Publication URL"
          placeholder="https://example.com/article"
        />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Publication Date*
          </Typography>
          <div className="flex gap-2">
            <ControlledTextField
              name="startedAtMonth"
              placeholder="Month"
            />
            <ControlledTextField
              name="startedAtYear"
              placeholder="Year"
            />
          </div>
        </div>
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Callout} bold>
          Description
        </Typography>
        <ControlledTextarea
          name="description"
          label="Summary, key findings, or abstract"
        />
      </div>
    </div>
  );
};

export default UserProjectPublicationForm;

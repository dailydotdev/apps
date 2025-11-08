import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';
import ControlledSwitch from '../../../../../components/fields/ControlledSwitch';

const UserOpenSourceProjectForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Project Name*"
          placeholder="Ex: React, Vue.js, TensorFlow"
        />
        <ControlledTextField
          name="url"
          label="Repository URL"
          placeholder="https://github.com/username/repo"
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch name="current">
        Active project
      </ControlledSwitch>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Start date*
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
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            End date*
          </Typography>
          <div className="flex gap-2">
            <ControlledTextField
              name="endedAtMonth"
              placeholder="Month"
            />
            <ControlledTextField
              name="endedAtYear"
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
          label="Describe your contributions, key features, and impact"
        />
      </div>
    </div>
  );
};

export default UserOpenSourceProjectForm;

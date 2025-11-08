import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import ProfileMonthYearSelect from '../../../../../components/profile/ProfileMonthYearSelect';
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
      <ControlledSwitch
        name="current"
        label="Active project"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Start date*
          </Typography>
          <ProfileMonthYearSelect
            name="startedAt"
            monthPlaceholder="Month"
            yearPlaceholder="Year"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            End date*
          </Typography>
          <ProfileMonthYearSelect
            name="endedAt"
            monthPlaceholder="Month"
            yearPlaceholder="Year"
          />
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

import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import ProfileMonthYearSelect from '../../../../../components/profile/ProfileMonthYearSelect';
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';
import ProfileSkills from '../../ProfileSkills';
import ControlledSwitch from '../../../../../components/fields/ControlledSwitch';

const UserOpenSourceForm = () => {
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
          placeholder="https://github.com/username/project"
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch
        name="current"
        label="Currently active"
        description="Check if you are currently contributing to this project"
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
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Description
          </Typography>
          <ControlledTextarea
            name="description"
            label="Describe your contributions, key features you built, or impact made"
          />
        </div>
        <ProfileSkills name="skills" />
      </div>
    </div>
  );
};

export default UserOpenSourceForm;

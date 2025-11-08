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
          placeholder="Ex: React Native Framework"
        />
        <ControlledTextField
          name="subtitle"
          label="Your Role*"
          placeholder="Ex: Core Contributor, Maintainer, Creator"
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch
        name="current"
        label="Currently contributing"
        description="Check if you are actively contributing to this project"
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
            End date
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
        <ControlledTextField
          name="url"
          label="Project URL*"
          placeholder="Ex: github.com/username/project"
        />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Description
          </Typography>
          <ControlledTextarea
            name="description"
            label="Describe your contributions, impact, and the technologies used"
          />
        </div>
        <ProfileSkills name="skills" />
      </div>
    </div>
  );
};

export default UserOpenSourceForm;

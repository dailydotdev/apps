import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import EmploymentTypeSelect from '../../../../../components/profile/EmploymentTypeSelect';
import ProfileCompany from '../../ProfileCompany';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import MonthYearSelect from '../../../../../components/profile/MonthYearSelect';
import ProfileLocation from '../../../../../components/profile/ProfileLocation';
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';
import ProfileSkills from '../../ProfileSkills';

const UserWorkExperienceForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Job Title*"
          placeholder="Ex: Retail Sales Manager"
        />
        <EmploymentTypeSelect
          name="employmentType"
          label="Employment Type"
          placeholder="Please select"
        />
        <ProfileCompany name="company" />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Current position
          </Typography>
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Start date*
          </Typography>
          <MonthYearSelect
            monthName="startMonth"
            yearName="startYear"
            monthPlaceholder="Month"
            yearPlaceholder="Year"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            End date*
          </Typography>
          <MonthYearSelect
            monthName="endMonth"
            yearName="endYear"
            monthPlaceholder="Month"
            yearPlaceholder="Year"
          />
        </div>
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <ProfileLocation locationName="location" typeName="locationType" />
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Description
          </Typography>
          <ControlledTextarea
            name="description"
            label="List your major duties and successes, highlighting specific projects"
          />
        </div>
        <ProfileSkills name="skills" />
      </div>
    </div>
  );
};

export default UserWorkExperienceForm;

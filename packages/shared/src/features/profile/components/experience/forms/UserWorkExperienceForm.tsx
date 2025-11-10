import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import EmploymentTypeSelect from '../../../../../components/profile/EmploymentTypeSelect';
import ProfileCompany from '../../ProfileCompany';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import ProfileMonthYearSelect from '../../../../../components/profile/ProfileMonthYearSelect';
import ProfileLocation from '../../../../../components/profile/ProfileLocation';
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';
import ProfileSkills from '../../ProfileSkills';
import ControlledSwitch from '../../../../../components/fields/ControlledSwitch';
import type { TLocation } from '../../../../../graphql/autocomplete';

const UserWorkExperienceForm = ({ location }: { location?: TLocation }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Job Title*"
          placeholder="Ex: Retail Sales Manager"
          fieldType="secondary"
          className={{
            outerLabel: '!px-0 !typo-callout',
            baseField: '!h-12',
          }}
        />
        <EmploymentTypeSelect
          name="employmentType"
          label="Employment Type"
          placeholder="Please select"
        />
        <ProfileCompany
          label="Company or organization*"
          name="customCompanyName"
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch
        name="current"
        label="Current position"
        description="Check if this is your current role"
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
          <ProfileLocation
            locationName="locationId"
            typeName="locationType"
            defaultValue={location}
          />
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

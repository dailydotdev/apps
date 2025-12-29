import React from 'react';
import { useFormContext } from 'react-hook-form';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import ProfileCompany from '../../ProfileCompany';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import ProfileMonthYearSelect from '../../../../../components/profile/ProfileMonthYearSelect';
import { AutocompleteType } from '../../../../../graphql/autocomplete';
import { profileSecondaryFieldStyles } from '../../../common';
import CurrentExperienceSwitch from '../../CurrentExperienceSwitch';

const UserVolunteeringExperienceForm = () => {
  const { watch } = useFormContext();
  const current = watch('current');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ProfileCompany
          name="customCompanyName"
          label="Organization*"
          type={AutocompleteType.Company}
        />
        <ControlledTextField
          name="title"
          label="Role*"
          placeholder="Ex: Mentor, Workshop Instructor, OSS Maintainer"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
      </div>
      <HorizontalSeparator />
      <CurrentExperienceSwitch
        label="Current volunteer role"
        description="Check if you are still actively volunteering in this position."
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Start date*
          </Typography>
          <ProfileMonthYearSelect
            name="startedAt"
            monthPlaceholder="January"
            yearPlaceholder="Year"
          />
        </div>
        {!current && (
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
        )}
      </div>
    </div>
  );
};

export default UserVolunteeringExperienceForm;

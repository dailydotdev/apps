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
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';
import { AutocompleteType } from '../../../../../graphql/autocomplete';
import { profileSecondaryFieldStyles } from '../../../common';
import CurrentExperienceSwitch from '../../CurrentExperienceSwitch';

const UserEducationForm = () => {
  const { watch } = useFormContext();
  const current = watch('current');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ProfileCompany
          name="customCompanyName"
          label="School*"
          type={AutocompleteType.School}
        />
        <ControlledTextField
          name="subtitle"
          label="Degree*"
          placeholder="Ex: Bachelor, Master, PhD, Diploma, Certificate"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <ControlledTextField
          name="title"
          label="Field of Study*"
          placeholder="Ex: Science in Computer Science"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
      </div>
      <HorizontalSeparator />
      <CurrentExperienceSwitch
        label="Current education"
        description="Check if you are currently enrolled in this program or pursuing this degree."
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
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            End date*
          </Typography>
          {!current && (
            <ProfileMonthYearSelect
              name="endedAt"
              monthPlaceholder="Month"
              yearPlaceholder="Year"
            />
          )}
        </div>
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="grade"
          label="Grade"
          placeholder="Ex: 3.8/4.0, First Class Honours, 85%"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Description
          </Typography>
          <ControlledTextarea
            name="description"
            label="Achievements, societies, coursework"
          />
        </div>
      </div>
    </div>
  );
};

export default UserEducationForm;

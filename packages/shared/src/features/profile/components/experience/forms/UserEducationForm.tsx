import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import ProfileCompany from '../../ProfileCompany';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import ProfileMonthYearSelect from '../../../../../components/profile/ProfileMonthYearSelect';
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';
import ControlledSwitch from '../../../../../components/fields/ControlledSwitch';
import { AutocompleteType } from '../../../../../graphql/autocomplete';

const UserEducationForm = () => {
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
        />
        <ControlledTextField
          name="title"
          label="Field of Study*"
          placeholder="Ex: Science in Computer Science"
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch
        name="currentPosition"
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
        <ControlledTextField
          name="grade"
          label="Grade"
          placeholder="Ex: 3.8/4.0, First Class Honours, 85%"
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

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

const UserProjectPublicationForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Project/Publication Title*"
          placeholder="Ex: Machine Learning for Web Development"
        />
        <ProfileCompany
          name="customCompanyName"
          label="Publisher/Organization"
          type={AutocompleteType.Company}
        />
        <ControlledTextField
          name="url"
          label="Project/Publication URL"
          placeholder="Link to project or publication"
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch
        name="current"
        label="Ongoing project"
        description="Check if this is an ongoing project or publication"
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
            label="Describe the project, key achievements, technologies used, or publication details"
          />
        </div>
      </div>
    </div>
  );
};

export default UserProjectPublicationForm;

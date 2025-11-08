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
import { AutocompleteType } from '../../../../../graphql/autocomplete';

const UserProjectPublicationForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Project/Publication Title*"
          placeholder="Ex: Machine Learning in Healthcare"
        />
        <ProfileCompany
          name="customCompanyName"
          label="Publisher/Organization"
          type={AutocompleteType.Company}
        />
        <ControlledTextField
          name="url"
          label="Project/Publication URL"
          placeholder="https://example.com/project"
        />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Publication Date*
          </Typography>
          <ProfileMonthYearSelect
            name="startedAt"
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
            label="Describe the project, publication, or research work"
          />
        </div>
      </div>
    </div>
  );
};

export default UserProjectPublicationForm;

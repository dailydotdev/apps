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
import ProfileSkills from '../../ProfileSkills';

const UserProjectPublicationForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Project/Publication Name*"
          placeholder="Ex: Building Scalable Microservices Architecture"
        />
        <ControlledTextField
          name="subtitle"
          label="Type*"
          placeholder="Ex: Research Paper, Conference Talk, Technical Blog, Side Project"
        />
        <ProfileCompany
          name="customCompanyName"
          label="Associated Organization"
          type={AutocompleteType.Company}
        />
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Date*
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
        <ControlledTextField
          name="url"
          label="URL"
          placeholder="Link to project, publication, or presentation"
        />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Description
          </Typography>
          <ControlledTextarea
            name="description"
            label="Describe the project, your role, impact, and key outcomes"
          />
        </div>
        <ProfileSkills name="skills" />
      </div>
    </div>
  );
};

export default UserProjectPublicationForm;

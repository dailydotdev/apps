import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import ProfileCompany from '../../ProfileCompany';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import ProfileMonthYearSelect from '../../../../../components/profile/ProfileMonthYearSelect';
import ProfileLocation from '../../../../../components/profile/ProfileLocation';
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';
import ControlledSwitch from '../../../../../components/fields/ControlledSwitch';
import type { TLocation } from '../../../../../graphql/autocomplete';
import { AutocompleteType } from '../../../../../graphql/autocomplete';

const UserVolunteeringForm = ({ location }: { location?: TLocation }) => {
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
          label="Role/Position*"
          placeholder="Ex: Volunteer Coordinator, Board Member"
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch
        name="current"
        label="Current position"
        description="Check if you are currently volunteering in this role"
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
            label="Describe your volunteer work, responsibilities, and impact"
          />
        </div>
      </div>
    </div>
  );
};

export default UserVolunteeringForm;

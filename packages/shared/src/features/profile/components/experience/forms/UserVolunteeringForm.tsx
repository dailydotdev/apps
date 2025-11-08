import React from 'react';
import ControlledTextField from '../../../../../components/fields/ControlledTextField';
import { HorizontalSeparator } from '../../../../../components/utilities';
import {
  Typography,
  TypographyType,
} from '../../../../../components/typography/Typography';
import ControlledTextarea from '../../../../../components/fields/ControlledTextarea';
import ControlledSwitch from '../../../../../components/fields/ControlledSwitch';

const UserVolunteeringForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Role*"
          placeholder="Ex: Volunteer Developer, Community Organizer"
        />
        <ControlledTextField
          name="customCompanyName"
          label="Organization*"
          placeholder="Ex: Code for America, Free Code Camp"
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch name="current">
        Current position
      </ControlledSwitch>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Start date*
          </Typography>
          <div className="flex gap-2">
            <ControlledTextField
              name="startedAtMonth"
              placeholder="Month"
            />
            <ControlledTextField
              name="startedAtYear"
              placeholder="Year"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            End date*
          </Typography>
          <div className="flex gap-2">
            <ControlledTextField
              name="endedAtMonth"
              placeholder="Month"
            />
            <ControlledTextField
              name="endedAtYear"
              placeholder="Year"
            />
          </div>
        </div>
      </div>
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="locationId"
          label="Location"
          placeholder="City, Country"
        />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Description
          </Typography>
          <ControlledTextarea
            name="description"
            label="Describe your role, responsibilities, and impact"
          />
        </div>
      </div>
    </div>
  );
};

export default UserVolunteeringForm;

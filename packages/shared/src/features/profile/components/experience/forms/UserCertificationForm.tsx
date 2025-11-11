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
import { profileSecondaryFieldStyles } from '../../../common';

const UserCertificationForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Certification Name*"
          placeholder="Ex: AWS Certified Solutions Architect"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <ProfileCompany
          name="customCompanyName"
          label="Issuing Organization*"
          type={AutocompleteType.Company}
        />
      </div>
      <HorizontalSeparator />
      <ControlledSwitch
        name="currentPosition"
        label="Currently valid certification"
        description="Check if this certification is still valid or active."
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Issue date*
          </Typography>
          <ProfileMonthYearSelect
            name="startedAt"
            monthPlaceholder="Month"
            yearPlaceholder="Year"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Expiration Date
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
          name="externalReferenceId"
          label="Credential ID"
          placeholder="Ex: Certificate number"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <ControlledTextField
          name="url"
          label="Credential URL"
          placeholder="Link to verification page"
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

export default UserCertificationForm;

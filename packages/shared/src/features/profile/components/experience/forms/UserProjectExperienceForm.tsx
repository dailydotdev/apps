import React, { useMemo } from 'react';
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
import { UserExperienceType } from '../../../../../graphql/user/profile';
import { profileSecondaryFieldStyles } from '../../../common';
import CurrentExperienceSwitch from '../../CurrentExperienceSwitch';

type FormCopy = {
  switchLabel: string;
  switchDescription: string;
};

const getFormCopy = (type: UserExperienceType): FormCopy => {
  if (type === UserExperienceType.OpenSource) {
    return {
      switchLabel: 'Active open-source contribution',
      switchDescription:
        'Check if you are still actively contributing to this open-source project.',
    };
  }

  return {
    switchLabel: 'Ongoing project/publication',
    switchDescription:
      'Check if this project or publication is currently active or ongoing.',
  };
};

const UserProjectExperienceForm = () => {
  const { watch } = useFormContext();
  const type = watch('type') as UserExperienceType;
  const copy = useMemo(() => getFormCopy(type), [type]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Title*"
          placeholder="Ex: Name of the publication or article"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <ProfileCompany
          name="customCompanyName"
          label="Publisher*"
          type={AutocompleteType.Company}
        />
      </div>
      <HorizontalSeparator />
      <CurrentExperienceSwitch
        label={copy.switchLabel}
        description={copy.switchDescription}
      />
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
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="url"
          label="Publication URL"
          placeholder="Ex: Validates against URL format"
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Description
          </Typography>
          <ControlledTextarea
            name="description"
            label="Summary of the work, focus area"
          />
        </div>
      </div>
    </div>
  );
};

export default UserProjectExperienceForm;

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
  titlePlaceholder: string;
  switchLabel: string;
  switchDescription: string;
  company: string;
  startedtLabel: string;
  urlLabel: string;
};

const getFormCopy = (type: UserExperienceType): FormCopy => {
  if (type === UserExperienceType.OpenSource) {
    return {
      titlePlaceholder: 'Ex: Name of the repository',
      switchLabel: 'Active open-source contribution',
      switchDescription:
        'Check if you are still actively contributing to this open-source project.',
      company: 'Repository*',
      startedtLabel: 'Active from',
      urlLabel: 'Repository URL',
    };
  }

  return {
    titlePlaceholder: 'Ex: Building Scalable APIs with Go',
    switchLabel: 'Ongoing project/publication',
    switchDescription:
      'Check if this project or publication is currently active or ongoing.',
    company: 'Publisher*',
    startedtLabel: 'Publication Date',
    urlLabel: 'Publication URL',
  };
};

const UserProjectExperienceForm = () => {
  const { watch } = useFormContext();
  const type = watch('type') as UserExperienceType;
  const current = watch('current');
  const copy = useMemo(() => getFormCopy(type), [type]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="title"
          label="Title*"
          placeholder={copy.titlePlaceholder}
          fieldType="secondary"
          className={profileSecondaryFieldStyles}
        />
        <ProfileCompany
          name="customCompanyName"
          label={copy.company}
          type={AutocompleteType.Company}
        />
      </div>
      <HorizontalSeparator />
      <CurrentExperienceSwitch
        label={copy.switchLabel}
        description={copy.switchDescription}
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            {copy.startedtLabel}*
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
      <HorizontalSeparator />
      <div className="flex flex-col gap-2">
        <ControlledTextField
          name="url"
          label={copy.urlLabel}
          placeholder="Ex: https://github.com/username/repo"
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
            maxLength={5000}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProjectExperienceForm;

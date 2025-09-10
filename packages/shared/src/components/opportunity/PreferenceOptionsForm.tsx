import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FlexCol, FlexRow } from '../utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import Textarea from '../fields/Textarea';
import { Radio } from '../fields/Radio';
import { Checkbox } from '../fields/Checkbox';
import { Dropdown } from '../fields/Dropdown';
import { TextField } from '../fields/TextField';
import { useAuthContext } from '../../contexts/AuthContext';
import { getCandidatePreferencesOptions } from '../../features/opportunity/queries';
import { RoleType } from '../../features/opportunity/types';
import { LocationType } from '../../features/opportunity/protobuf/util';
import {
  EmploymentType,
  SalaryPeriod,
} from '../../features/opportunity/protobuf/opportunity';
import { snapToHalf } from '../../lib/utils';

const salaryDurationOptions = [
  { label: 'Annually', value: SalaryPeriod.ANNUAL },
  { label: 'Monthly', value: SalaryPeriod.MONTHLY },
  { label: 'Hourly', value: SalaryPeriod.HOURLY },
];

const salaryOptions = salaryDurationOptions.map((option) => option.label);

const locationTypeOptions = [
  { label: 'Remote', value: LocationType.REMOTE },
  { label: 'Hybrid', value: LocationType.HYBRID },
  { label: 'On-site', value: LocationType.OFFICE },
];

const employmentTypeOptions = [
  { label: 'Full-time', value: EmploymentType.FULL_TIME },
  { label: 'Part-time', value: EmploymentType.PART_TIME },
  { label: 'Contract / Freelance', value: EmploymentType.CONTRACT },
  { label: 'Internship', value: EmploymentType.INTERNSHIP },
];

export const PreferenceOptionsForm = (): ReactElement => {
  const [selectedSalaryOption, setSelectedSalaryOption] = useState(0);
  const [selectedRole, setSelectedRole] = useState(RoleType.Auto.toFixed(1));

  const { user } = useAuthContext();

  const { data: preferences } = useQuery(
    getCandidatePreferencesOptions(user?.id),
  );

  useEffect(() => {
    if (!preferences) {
      return;
    }

    setSelectedRole(snapToHalf(preferences?.roleType).toFixed(1));
    if (preferences?.salaryExpectation?.period) {
      setSelectedSalaryOption(
        salaryDurationOptions.findIndex(
          (option) => option.value === preferences.salaryExpectation.period,
        ),
      );
    }
  }, [preferences]);

  return (
    <FlexCol className="gap-6">
      <FlexCol className="gap-2">
        <Typography type={TypographyType.Body} bold>
          What kind of role are you looking for?
        </Typography>

        {/* Role */}
        <Textarea
          inputId="role"
          label="role"
          rows={5}
          placeholder="Describe your next ideal role or career goal…"
          fieldType="quaternary"
          value={preferences?.role}
        />

        {/* Role Type */}
        <Radio
          className={{ container: 'flex-1 !flex-row flex-wrap' }}
          name="role_type"
          options={[
            { label: 'Auto (Recommended)', value: RoleType.Auto.toFixed(1) },
            { label: 'IC roles', value: RoleType.IC.toFixed(1) },
            {
              label: 'Managerial roles',
              value: RoleType.Managerial.toFixed(1),
            },
          ]}
          value={selectedRole}
          onChange={(value) => setSelectedRole(value)}
        />
      </FlexCol>

      {/* Employment type */}
      <FlexCol className="gap-2">
        <Typography type={TypographyType.Body} bold>
          Employment type
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Select all that apply to the roles you&apos;d consider.
        </Typography>

        {/* Employment type */}
        <FlexRow className="flex-wrap">
          {employmentTypeOptions.map(({ label, value }) => (
            <Checkbox
              key={value}
              name={value.toString()}
              checked={preferences?.employmentType?.includes(value)}
            >
              {label}
            </Checkbox>
          ))}
        </FlexRow>
      </FlexCol>

      {/* Salary expectations */}
      <FlexCol className="gap-2">
        <Typography type={TypographyType.Body} bold>
          Salary expectations
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Give a minimum so we only surface roles that meet your requirements.
        </Typography>
        <FlexRow className="gap-3">
          <TextField
            inputId="min"
            label="USD"
            value={preferences?.salaryExpectation?.min?.toLocaleString('en-US')}
            className={{ container: 'w-40' }}
          />
          <Dropdown
            selectedIndex={selectedSalaryOption}
            options={salaryOptions}
            className={{ label: 'text-text-primary' }}
            onChange={(option) => {
              setSelectedSalaryOption(salaryOptions.indexOf(option));
            }}
          />
        </FlexRow>
      </FlexCol>

      {/* Location preferences */}
      <FlexCol className="gap-2">
        <Typography type={TypographyType.Body} bold>
          Location preferences
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Tell us where you want to work from.
        </Typography>
        <FlexRow className="gap-3">
          <TextField
            inputId="country"
            label="Country"
            value={preferences?.location?.[0].country}
            className={{ container: 'flex-1' }}
          />
          <TextField
            inputId="city"
            label="City"
            value={preferences?.location?.[0].city}
            className={{ container: 'flex-1' }}
          />
        </FlexRow>

        {/* Location type */}
        <FlexRow>
          {locationTypeOptions.map(({ label, value }) => (
            <Checkbox
              key={value}
              name={value.toString()}
              checked={preferences?.locationType?.includes(value)}
            >
              {label}
            </Checkbox>
          ))}
        </FlexRow>
      </FlexCol>

      {/* Tech stack */}
      <FlexCol className="gap-2">
        <Typography type={TypographyType.Body} bold>
          Preferred tech stack
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Define the tools, technologies, and languages you want in your next
          role.
        </Typography>
        <Radio
          className={{ container: '!flex-row flex-wrap' }}
          name="tech_stack"
          options={[
            { label: 'Copy from my profile (Recommended)', value: 'auto' },
            { label: 'Select manually', value: 'manual' },
          ]}
          value="auto"
          onChange={() => {}}
        />
      </FlexCol>
    </FlexCol>
  );
};

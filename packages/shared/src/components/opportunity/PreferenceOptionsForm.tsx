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

const salaryOptions = ['Annually', 'Monthly'];

export const snapToHalf = (v: number): 0.0 | 0.5 | 1.0 => {
  const x = Math.min(1, Math.max(0, v));

  if (x < 0.25) {
    return 0.0;
  }
  if (x < 0.75) {
    return 0.5;
  }

  return 1.0;
};

const locationTypeOptions = [
  { label: 'Remote', value: LocationType.REMOTE },
  { label: 'Hybrid', value: LocationType.HYBRID },
  { label: 'On-site', value: LocationType.OFFICE },
];

export const PreferenceOptionsForm = (): ReactElement => {
  const [selectedSalaryOption, setSelectedSalaryOption] = useState(0);
  const [selectedRole, setSelectedRole] = useState(RoleType.Auto.toFixed(1));

  const { user } = useAuthContext();

  const { data: preferences } = useQuery(
    getCandidatePreferencesOptions(user.id),
  );

  useEffect(() => {
    if (!preferences) {
      return;
    }

    setSelectedRole(snapToHalf(preferences.roleType).toFixed(1));
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
          value={preferences.role}
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
          <Checkbox name="full_time">Full-time</Checkbox>
          <Checkbox name="part-time">Part-time</Checkbox>
          <Checkbox name="contract">Contract / Freelance</Checkbox>
          <Checkbox name="internship">Internship</Checkbox>
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
            value="120.000"
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
            className={{ container: 'flex-1' }}
          />
          <TextField
            inputId="city"
            label="City"
            className={{ container: 'flex-1' }}
          />
        </FlexRow>

        {/* Location type */}
        <FlexRow>
          {locationTypeOptions.map(({ label, value }) => (
            <Checkbox
              key={value}
              name={value.toString()}
              checked={preferences.locationType.includes(value)}
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

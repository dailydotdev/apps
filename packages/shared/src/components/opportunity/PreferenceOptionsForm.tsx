import type { ReactElement } from 'react';
import React, { useState } from 'react';
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

const salaryOptions = ['Annually', 'Monthly'];

export const PreferenceOptionsForm = (): ReactElement => {
  const [selectedSalaryOption, setSelectedSalaryOption] = useState(0);

  return (
    <FlexCol className="gap-6">
      <FlexCol className="gap-2">
        <Typography type={TypographyType.Body} bold>
          What kind of role are you looking for?
        </Typography>
        <Textarea
          inputId="role"
          label="role"
          rows={5}
          placeholder="Describe your next ideal role or career goal…"
          fieldType="quaternary"
        />
        <Radio
          className={{ container: 'flex-1 !flex-row flex-wrap' }}
          name="type_role"
          options={[
            { label: 'Auto (Recommended)', value: 'auto' },
            { label: 'IC roles', value: 'ic' },
            { label: 'Managerial roles', value: 'managerial' },
          ]}
          value="auto"
          onChange={() => {}}
        />
      </FlexCol>
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
        <FlexRow className="flex-wrap">
          <Checkbox name="full_time">Full-time</Checkbox>
          <Checkbox name="part-time">Part-time</Checkbox>
          <Checkbox name="contract">Contract / Freelance</Checkbox>
          <Checkbox name="internship">Internship</Checkbox>
        </FlexRow>
      </FlexCol>
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
        <FlexRow>
          <Checkbox name="remote">Remote</Checkbox>
          <Checkbox name="hybrid">Hybrid</Checkbox>
          <Checkbox name="on-site">On-site</Checkbox>
        </FlexRow>
      </FlexCol>
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

import React from 'react';
import Select from '../fields/Select';
import { EmploymentType } from '../../features/opportunity/protobuf/opportunity';
import { ButtonSize } from '../buttons/Button';
import { Typography, TypographyType } from '../typography/Typography';

const employmentTypeOptions = [
  { label: 'Full-time', value: EmploymentType.FULL_TIME.toString() },
  { label: 'Part-time', value: EmploymentType.PART_TIME.toString() },
  { label: 'Contract / Freelance', value: EmploymentType.CONTRACT.toString() },
  { label: 'Internship', value: EmploymentType.INTERNSHIP.toString() },
];

type EmploymentTypeSelectProps = {
  name: string;
  placeholder?: string;
  label?: string;
};

const EmploymentTypeSelect = ({
  name,
  placeholder,
  label,
}: EmploymentTypeSelectProps) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <Typography type={TypographyType.Callout} bold>
          {label}
        </Typography>
      )}
      <Select
        options={employmentTypeOptions}
        name={name}
        placeholder={placeholder}
        buttonProps={{
          size: ButtonSize.Large,
        }}
      />
    </div>
  );
};

export default EmploymentTypeSelect;

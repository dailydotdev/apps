import React from 'react';
import Select from '../fields/Select';
import { ExperienceLevelOptions } from '../../lib/user';
import { ButtonSize } from '../buttons/ButtonV2';
import type { IconType } from '../buttons/ButtonV2';

type ExperienceSelectProps = {
  name: string;
  icon?: IconType;
  placeholder?: string;
};

const ExperienceSelect = ({
  name,
  icon,
  placeholder,
}: ExperienceSelectProps) => {
  return (
    <Select
      icon={icon}
      options={ExperienceLevelOptions}
      name={name}
      placeholder={placeholder}
      buttonProps={{
        size: ButtonSize.Large,
      }}
    />
  );
};

export default ExperienceSelect;

import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import ControlledSwitch from '../../../components/fields/ControlledSwitch';

type CurrentExperienceSwitchProps = {
  label: string;
  description: string;
};

const CurrentExperienceSwitch = ({
  label,
  description,
}: CurrentExperienceSwitchProps) => {
  const { setValue, watch } = useFormContext();
  const endedAt = watch('endedAt');

  const handleChange = (value: boolean) => {
    if (value) {
      setValue('endedAt', null);
      setValue('endedAtMonth', '');
      setValue('endedAtYear', '');
    }
  };

  useEffect(() => {
    if (endedAt) {
      setValue('current', false);
    }
  }, [endedAt, setValue]);

  return (
    <ControlledSwitch
      name="current"
      label={label}
      description={description}
      onChange={handleChange}
    />
  );
};

export default CurrentExperienceSwitch;

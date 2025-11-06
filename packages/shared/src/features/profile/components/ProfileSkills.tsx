import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { KeywordSelection } from '../../opportunity/components/KeywordSelection';

type ProfileSkillsProps = {
  name: string;
};

const ProfileSkills = ({ name }: ProfileSkillsProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Skills
          </Typography>
          <KeywordSelection
            keywords={field.value}
            addKeyword={field.onChange}
            removeKeyword={field.onChange}
          />
        </div>
      )}
    />
  );
};

export default ProfileSkills;

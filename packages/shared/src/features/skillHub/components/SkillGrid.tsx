import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Skill } from '../types';
import { SkillCard } from './SkillCard';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface SkillGridProps {
  title: string;
  skills: Skill[];
  className?: string;
}

export const SkillGrid = ({
  title,
  skills,
  className,
}: SkillGridProps): ReactElement => {
  return (
    <section className={classNames('flex flex-col gap-4', className)}>
      <Typography tag={TypographyTag.H2} type={TypographyType.Title3}>
        {title}
      </Typography>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptopXL:grid-cols-3">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </section>
  );
};

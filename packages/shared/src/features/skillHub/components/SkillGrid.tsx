import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Skill } from '../types';
import { SkillCard } from './SkillCard';
import { SkillDetailModal } from './SkillDetailModal';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ArrowIcon, HotIcon, AddUserIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';

interface SkillGridProps {
  title: string;
  skills: Skill[];
  className?: string;
  icon?: 'trending' | 'recent';
}

const getIcon = (icon?: 'trending' | 'recent'): ReactElement | null => {
  if (icon === 'trending') {
    return (
      <HotIcon size={IconSize.Medium} className="text-accent-cheese-default" />
    );
  }
  if (icon === 'recent') {
    return (
      <AddUserIcon
        size={IconSize.Medium}
        className="text-accent-cabbage-default"
      />
    );
  }
  return null;
};

export const SkillGrid = ({
  title,
  skills,
  className,
  icon,
}: SkillGridProps): ReactElement => {
  const iconElement = getIcon(icon);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
  };

  return (
    <>
      <section className={classNames('flex flex-col gap-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {iconElement}
            <Typography tag={TypographyTag.H2} type={TypographyType.Title3}>
              {title}
            </Typography>
          </div>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="text-text-tertiary hover:text-text-primary"
          >
            View all
            <ArrowIcon className="ml-1 rotate-90" size={IconSize.Size16} />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptopXL:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onClick={() => handleSkillClick(skill)}
            />
          ))}
        </div>
      </section>
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          isOpen={Boolean(selectedSkill)}
          onRequestClose={handleCloseModal}
        />
      )}
    </>
  );
};

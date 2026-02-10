import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchField } from '../../../components/fields/SearchField';
import { Button, ButtonSize, ButtonVariant } from '../../../components/buttons/Button';
import {
  FlagIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldWarningIcon,
  SparkleIcon,
} from '../../../components/icons';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { IconSize } from '../../../components/Icon';

const categories = [
  'All',
  'Code Review',
  'Database',
  'DevOps',
  'Testing',
  'Documentation',
  'Security',
  'Design',
];

export const SkillHubHeader = (): ReactElement => {
  return (
    <section className="rounded-24 border border-border-subtlest-tertiary bg-surface-float p-4 tablet:p-6">
      <div className="flex flex-col gap-4 tablet:gap-6 laptop:flex-row laptop:items-start laptop:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-16 bg-action-upvote-float text-action-upvote-default">
              <SparkleIcon size={IconSize.Small} />
            </span>
            <div>
              <Typography tag={TypographyTag.H1} type={TypographyType.Title1}>
                Skill Hub
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                className="text-text-secondary"
              >
                Discover, share, and discuss skills for humans and agents.
              </Typography>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Button
                key={category}
                size={ButtonSize.Small}
                variant={ButtonVariant.Subtle}
                pressed={index === 0}
                className={classNames(
                  'border border-border-subtlest-tertiary !font-normal',
                  index === 0 && 'text-text-primary',
                )}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-primary p-4">
            <Typography tag={TypographyTag.P} type={TypographyType.Callout} bold>
              Security layer
            </Typography>
            <div className="flex flex-wrap gap-3 text-text-tertiary">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon size={IconSize.Size16} />
                <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
                  Verified publishers
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <ShieldWarningIcon size={IconSize.Size16} />
                <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
                  Automated scans
                </Typography>
              </div>
              <div className="flex items-center gap-2">
                <FlagIcon size={IconSize.Size16} />
                <Typography tag={TypographyTag.Span} type={TypographyType.Caption1}>
                  Report suspicious skills
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 laptop:w-[22rem]">
          <SearchField
            inputId="skill-hub-search"
            placeholder="Search skills, tags, or authors"
          />
          <Button
            icon={<PlusIcon />}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Medium}
            className="justify-center"
          >
            Share a Skill
          </Button>
        </div>
      </div>
    </section>
  );
};

import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchField } from '../../../components/fields/SearchField';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  FlagIcon,
  PlusIcon,
  ShieldCheckIcon,
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
    <section className="relative overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-surface-float">
      {/* Gradient background glow */}
      <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl" />
      <div className="bg-accent-onion-default/15 pointer-events-none absolute -right-20 -top-10 h-48 w-48 rounded-full blur-3xl" />
      <div className="bg-accent-water-default/10 pointer-events-none absolute -bottom-10 left-1/3 h-40 w-40 rounded-full blur-3xl" />

      <div className="relative p-4 tablet:p-6">
        <div className="flex flex-col gap-4 tablet:gap-6 laptop:flex-row laptop:items-start laptop:justify-between">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="relative flex h-14 w-14 items-center justify-center rounded-18 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default shadow-2-cabbage">
                <SparkleIcon
                  size={IconSize.Large}
                  className="text-white"
                  secondary
                />
                <span className="shadow-1 absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-float text-[10px] font-bold text-accent-cabbage-default">
                  ✨
                </span>
              </span>
              <div>
                <Typography
                  tag={TypographyTag.H1}
                  type={TypographyType.LargeTitle}
                  className="bg-gradient-to-r from-text-primary via-accent-cabbage-bolder to-accent-onion-default bg-clip-text text-transparent"
                >
                  Skill Hub
                </Typography>
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Body}
                  className="text-text-secondary"
                >
                  Discover, share, and discuss skills for humans and agents.
                </Typography>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Button
                  key={category}
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Subtle}
                  pressed={index === 0}
                  className={classNames(
                    'border border-border-subtlest-tertiary !font-normal transition-all duration-200',
                    index === 0
                      ? 'border-accent-cabbage-default/40 bg-accent-cabbage-subtlest text-accent-cabbage-default'
                      : 'hover:border-border-subtlest-secondary hover:bg-surface-hover',
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Security callout - more subtle and elegant */}
            <div className="border-accent-avocado-default/20 bg-accent-avocado-subtlest/50 flex flex-col gap-2 rounded-16 border p-3">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon
                  size={IconSize.Size16}
                  className="text-accent-avocado-default"
                />
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Footnote}
                  bold
                  className="text-accent-avocado-default"
                >
                  Security layer
                </Typography>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-tertiary">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-avocado-default" />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                  >
                    Verified publishers
                  </Typography>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-avocado-default" />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                  >
                    Automated scans
                  </Typography>
                </div>
                <div className="flex items-center gap-1.5">
                  <FlagIcon
                    size={IconSize.Size12}
                    className="text-text-tertiary"
                  />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                  >
                    Report suspicious
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Search and CTA */}
          <div className="flex w-full flex-col gap-3 laptop:w-80">
            <SearchField
              inputId="skill-hub-search"
              placeholder="Search skills, tags, or authors"
              className="shadow-1"
            />
            <Button
              icon={<PlusIcon />}
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="justify-center bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default transition-all duration-200 hover:shadow-2-cabbage"
            >
              Share a Skill
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

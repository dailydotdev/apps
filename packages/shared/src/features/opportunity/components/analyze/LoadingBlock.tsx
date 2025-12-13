import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { MagicIcon, ShieldIcon, VIcon } from '../../../../components/icons';
import { Divider } from '../../../../components/utilities';
import { Loader } from '../../../../components/Loader';

type LoadingBlockItemProps = {
  icon: ReactElement;
  description: string;
  className?: string;
  isComplete?: boolean;
  isActive?: boolean;
  isVisible?: boolean;
};

const LoadingBlockItem = ({
  icon: Icon,
  description,
  className,
  isComplete = false,
  isActive = false,
  isVisible = true,
}: LoadingBlockItemProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex flex-row items-center gap-2 transition-opacity duration-300',
        className,
        {
          'opacity-100': isComplete || isActive,
          'opacity-40': !isComplete && !isActive,
        },
      )}
    >
      {isActive && !isComplete ? <Loader className="size-5" /> : Icon}
      {description}
    </div>
  );
};

type LoadingBlockProps = {
  loadingStep: number;
};

export const LoadingBlock = ({ loadingStep }: LoadingBlockProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-16 bg-brand-float p-3">
      <LoadingBlockItem
        icon={<MagicIcon className="text-brand-default" />}
        description="Your hiring edge is loading."
        className="font-bold typo-callout"
        isComplete
      />
      <div className="flex flex-col gap-2">
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Reading your job description"
          className="typo-subhead"
          isComplete={loadingStep >= 1}
          isActive={loadingStep === 0}
          isVisible={loadingStep >= 0}
        />
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Mapping skills, requirements, and intent"
          className="typo-subhead"
          isComplete={loadingStep >= 2}
          isActive={loadingStep === 1}
          isVisible={loadingStep >= 1}
        />
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Scanning the daily.dev network"
          className="typo-subhead"
          isComplete={loadingStep >= 3}
          isActive={loadingStep === 2}
          isVisible={loadingStep >= 2}
        />
        <LoadingBlockItem
          icon={
            <div className="size-5 rounded-8 bg-brand-float text-brand-default">
              <VIcon />
            </div>
          }
          description="Ranking engineers most likely to engage"
          className="typo-subhead"
          isComplete={loadingStep >= 4}
          isActive={loadingStep === 3}
          isVisible={loadingStep >= 3}
        />
      </div>
      <Divider className="bg-border-subtlest-tertiary" />
      <LoadingBlockItem
        icon={<ShieldIcon secondary />}
        description="No scraping. No spam. Only real intent."
        className="text-text-tertiary typo-footnote"
        isComplete
      />
    </div>
  );
};

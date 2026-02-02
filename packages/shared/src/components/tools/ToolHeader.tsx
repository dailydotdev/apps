import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Tool } from '../../lib/toolsMockData';
import { Image } from '../image/Image';
import { Button, ButtonVariant, ButtonColor } from '../buttons/Button';
import { UpvoteIcon } from '../icons';
import { largeNumberFormat } from '../../lib';

export interface ToolHeaderProps {
  tool: Tool;
  isUpvoted: boolean;
  onUpvote: () => void;
  className?: string;
}

export const ToolHeader = ({
  tool,
  isUpvoted,
  onUpvote,
  className,
}: ToolHeaderProps): ReactElement => {
  return (
    <div className={classNames('flex flex-col', className)}>
      <div className="flex items-start gap-4">
        <Image
          className="size-16 rounded-16 object-cover laptop:size-20"
          src={tool.image}
          alt={`${tool.name} logo`}
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-bold text-text-primary typo-title1">
            {tool.name}
          </h1>
          <p className="mt-2 text-text-secondary typo-body">
            {tool.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Button
          variant={ButtonVariant.Secondary}
          color={isUpvoted ? ButtonColor.Avocado : undefined}
          pressed={isUpvoted}
          onClick={onUpvote}
          icon={<UpvoteIcon secondary={isUpvoted} />}
        >
          {largeNumberFormat(tool.upvotes + (isUpvoted ? 1 : 0))}
        </Button>
        <span className="text-text-tertiary typo-callout">
          {tool.relatedPosts.length} related posts
        </span>
        <span className="text-text-tertiary typo-callout">
          {tool.comments.length} discussions
        </span>
      </div>
    </div>
  );
};

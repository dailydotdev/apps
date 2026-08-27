import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PlusIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { ToolLogo } from '@dailydotdev/shared/src/components/tools/ToolLogo';

export interface ToolCardTool {
  id: string;
  title: string;
  slug: string;
  faviconUrl: string | null;
  url?: string | null;
  stackCount: number;
}

interface ToolCardProps {
  tool: ToolCardTool;
  onClick?: () => void;
  isInStack?: boolean;
  onAddToStack?: (tool: ToolCardTool) => void;
}

// The anchor stretches over the card; the stack button is a sibling above it.
export const ToolCard = ({
  tool,
  onClick,
  isInStack = false,
  onAddToStack,
}: ToolCardProps): ReactElement => {
  const formattedCount = largeNumberFormat(tool.stackCount) ?? tool.stackCount;

  return (
    <div className="group relative flex items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-4 transition-colors hover:border-border-subtlest-secondary">
      <Link href={`/tools/${tool.slug}`} passHref>
        <a
          href={`/tools/${tool.slug}`}
          className="absolute inset-0 rounded-16"
          onClick={onClick}
          aria-label={`${tool.title}, ${formattedCount} in stacks`}
        />
      </Link>
      <ToolLogo
        title={tool.title}
        faviconUrl={tool.faviconUrl}
        url={tool.url}
        className="pointer-events-none size-12 rounded-14"
        plateClassName="bg-white p-1.5"
      />
      <span className="pointer-events-none flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Body} bold truncate>
          {tool.title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {formattedCount} in stacks
        </Typography>
      </span>
      {onAddToStack && (
        <Tooltip
          content={
            isInStack ? 'In your stack' : `Add ${tool.title} to my stack`
          }
        >
          <Button
            type="button"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            icon={isInStack ? <VIcon aria-hidden /> : <PlusIcon aria-hidden />}
            aria-label={
              isInStack
                ? `${tool.title} is in your stack`
                : `Add ${tool.title} to my stack`
            }
            aria-disabled={isInStack}
            onClick={() => !isInStack && onAddToStack(tool)}
            className={classNames(
              'relative shrink-0',
              isInStack
                ? '!text-brand-default'
                : 'transition-opacity focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100',
            )}
          />
        </Tooltip>
      )}
    </div>
  );
};

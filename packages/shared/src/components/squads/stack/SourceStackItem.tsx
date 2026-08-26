import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SourceStack } from '../../../graphql/source/sourceStack';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { EditIcon, PlusIcon, TrashIcon } from '../../icons';
import Link from '../../utilities/Link';
import ConditionalWrapper from '../../ConditionalWrapper';
import { webappUrl } from '../../../lib/constants';

interface SourceStackItemProps {
  item: SourceStack;
  canEdit: boolean;
  onEdit?: (item: SourceStack) => void;
  onDelete?: (item: SourceStack) => void;
}

export function SourceStackItem({
  item,
  canEdit,
  onEdit,
  onDelete,
}: SourceStackItemProps): ReactElement {
  const { tool } = item;
  const title = item.title ?? tool.title;
  const isLinkable = !!tool.slug;
  const toolUrl = `${webappUrl}tools/${tool.slug}`;

  return (
    <div
      className={classNames(
        'group relative flex items-center justify-between gap-3 rounded-12 border border-border-subtlest-tertiary px-3 pb-2.5 pt-2',
        'hover:border-border-subtlest-secondary',
      )}
    >
      <ConditionalWrapper
        condition={isLinkable}
        wrapper={(children) => (
          <Link href={toolUrl}>
            <a href={toolUrl} className="flex min-w-0 items-center gap-2">
              {children}
            </a>
          </Link>
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {tool.faviconUrl ? (
            <img
              src={tool.faviconUrl}
              alt=""
              className="rounded size-6 flex-shrink-0"
            />
          ) : (
            <PlusIcon className="size-6 flex-shrink-0 text-text-tertiary" />
          )}
          {!!title && (
            <div className="flex min-w-0 flex-1 flex-col">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
                truncate
              >
                {title}
              </Typography>
            </div>
          )}
        </div>
      </ConditionalWrapper>
      {canEdit && (
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<EditIcon />}
              onClick={() => onEdit(item)}
              aria-label="Edit stack item"
            />
          )}
          {onDelete && (
            <Button
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<TrashIcon />}
              onClick={() => onDelete(item)}
              aria-label="Delete stack item"
            />
          )}
        </div>
      )}
    </div>
  );
}

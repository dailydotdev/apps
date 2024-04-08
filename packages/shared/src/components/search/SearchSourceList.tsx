import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { widgetClasses } from '../widgets/common';
import { ArrowIcon } from '../icons';
import { PlaceholderSearchSource } from './PlaceholderSearchSource';
import { PageWidgets } from '../utilities';
import { SearchSourceItem } from './SearchSourceItem';
import { SearchChunkSource } from '../../graphql/search';
import { PaginationActions } from '../pagination';
import { usePagination } from '../../hooks/utils';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';

interface SearchSourceListProps {
  sources: SearchChunkSource[];
  isLoading?: boolean;
  className?: string;
}

export const SearchSourceList = ({
  sources,
  isLoading,
  className,
}: SearchSourceListProps): ReactElement => {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const { sidebarRendered } = useSidebarRendered();
  const { paginated, ...pagination } = usePagination({
    items: sources,
    limit: 3,
  });

  if (!isLoading && !sources?.length) {
    return null;
  }

  const handleSourceClick = (): void =>
    !sidebarRendered && setIsSourcesOpen((prev) => !prev);

  return (
    <PageWidgets className={classNames(className, 'relative')}>
      <i className="absolute -left-8 top-8 hidden h-px w-12 bg-border-subtlest-tertiary laptop:block" />
      <div className={classNames('flex flex-col', widgetClasses)}>
        <div
          className={classNames(
            'flex cursor-pointer items-center justify-between rounded-t-16 bg-background-subtle px-4 py-1.5 laptop:cursor-auto laptop:bg-transparent laptop:py-4 laptop:!pb-0',
            isSourcesOpen ? 'rounded-t-16' : 'rounded-16',
          )}
          role="button"
          tabIndex={0}
          aria-label="Sources"
          onKeyDown={handleSourceClick}
          onClick={handleSourceClick}
        >
          <p className="font-bold text-text-quaternary typo-callout laptop:text-text-quaternary">
            Sources{' '}
            <span className="inline-block laptop:hidden">
              ({sources?.length ?? 1})
            </span>
          </p>
          <Button
            icon={
              <ArrowIcon
                className={classNames(isSourcesOpen && 'rotate-180')}
              />
            }
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="block laptop:hidden"
          />
        </div>
        <div
          className={classNames(
            'flex-col gap-4 overflow-x-scroll p-4 laptop:min-h-[14rem]',
            isSourcesOpen ? 'flex' : 'hidden laptop:flex',
          )}
        >
          {isLoading && !sources?.length ? (
            <PlaceholderSearchSource />
          ) : (
            (sidebarRendered ? paginated : sources)?.map((source) => (
              <SearchSourceItem key={source.id} item={source} />
            ))
          )}
        </div>
        <PaginationActions {...pagination} />
      </div>
    </PageWidgets>
  );
};

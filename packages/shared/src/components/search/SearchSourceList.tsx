import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { widgetClasses } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { PlaceholderSearchSource } from './PlaceholderSearchSource';
import { PageWidgets } from '../utilities';
import { SearchSourceItem } from './SearchSourceItem';
import { SearchChunkSource } from '../../graphql/search';
import { PaginationActions } from '../pagination';
import { usePagination } from '../../hooks/utils';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import { SearchReferralBanner } from './SearchReferralBanner';

interface SearchSourceListProps {
  sources: SearchChunkSource[];
  isLoading?: boolean;
}

export const SearchSourceList = ({
  sources,
  isLoading,
}: SearchSourceListProps): ReactElement => {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const { sidebarRendered } = useSidebarRendered();
  const { paginated, ...pagination } = usePagination({
    items: sources,
    limit: 3,
  });

  const handleSourceClick = (): void =>
    !sidebarRendered && setIsSourcesOpen((prev) => !prev);

  return (
    <PageWidgets
      tablet={false}
      className="relative order-3 laptop:order-last col-span-2 laptop:col-span-1"
    >
      <i className="hidden laptop:block absolute top-8 -left-8 w-12 h-px bg-theme-divider-tertiary" />
      <div className={classNames('flex flex-col', widgetClasses)}>
        <div
          className={classNames(
            'cursor-pointer laptop:cursor-auto flex justify-between items-center py-1.5 laptop:py-4 px-4 laptop:!pb-0 laptop:bg-transparent rounded-t-16 bg-theme-bg-secondary',
            isSourcesOpen ? 'rounded-t-16' : 'rounded-16',
          )}
          role="button"
          tabIndex={0}
          aria-label="Sources"
          onKeyDown={handleSourceClick}
          onClick={handleSourceClick}
        >
          <p className="font-bold typo-callout text-theme-label-quaternary laptop:text-theme-label-quaternary">
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
            iconOnly
            buttonSize={ButtonSize.Small}
            className="block laptop:hidden btn-tertiary"
          />
        </div>
        <div
          className={classNames(
            'gap-4 p-4 laptop:min-h-[14rem] overflow-x-scroll flex-col',
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

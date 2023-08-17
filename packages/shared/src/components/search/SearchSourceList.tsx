import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { widgetClasses } from '../widgets/common';
import { Button, ButtonSize } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { PlaceholderSearchSource } from './PlaceholderSearchSource';
import { PageWidgets } from '../utilities';
import { SourceItem } from './SearchSourceItem';
import { SearchChunkSource } from '../../graphql/search';
import { PaginationContainer } from '../pagination';

interface SearchSourceListProps {
  sources: SearchChunkSource[];
}

export const SearchSourceList = ({
  sources,
}: SearchSourceListProps): ReactElement => {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  return (
    <PageWidgets tablet={false} className="relative order-2 laptop:order-last">
      <i className="hidden laptop:block absolute top-8 -left-8 w-12 h-px bg-theme-divider-tertiary" />
      <PaginationContainer className={widgetClasses} max={10}>
        <div
          className={classNames(
            'flex justify-between items-center py-1.5 laptop:py-4 px-4 laptop:bg-transparent rounded-t-16 bg-theme-bg-secondary',
            isSourcesOpen ? 'rounded-t-16' : 'rounded-16',
          )}
        >
          <p className="font-bold typo-callout text-theme-label-tertiary laptop:text-theme-label-quaternary">
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
            onClick={() => setIsSourcesOpen((prev) => !prev)}
          />
        </div>
        <div
          className={classNames(
            'gap-4 p-4 laptop:min-h-[14rem] overflow-x-scroll flex-row laptop:flex-col',
            isSourcesOpen ? 'flex' : 'hidden laptop:flex',
          )}
        >
          <PlaceholderSearchSource />
          {Array(5)
            .fill(0)
            .map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <SourceItem key={i} />
            ))}
        </div>
      </PaginationContainer>
    </PageWidgets>
  );
};

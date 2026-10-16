import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import { OnboardingHeadline } from '@dailydotdev/shared/src/components/onboarding/common';
import { TagSelection } from '@dailydotdev/shared/src/components/tags/TagSelection';
import type { OnboardingTagProps } from '@dailydotdev/shared/src/components/tags/TagElement';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import { useTagSearch } from '@dailydotdev/shared/src/hooks/useTagSearch';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { usePickedTags } from './previewData';

export interface VariantProps {
  onContinue: () => void;
  // Opens the preview on mount, for the review frames.
  initialOpen?: boolean;
}

export interface TagStepFrameProps {
  // Replaces the production headline above the search field.
  header?: ReactNode;
  // Rendered under the tag cloud, where production puts the preview toggle.
  children?: ReactNode;
  docked?: ReactNode;
  // A second column beside the tags from laptop up.
  aside?: ReactNode;
  // Scrolls the preview into view on mount, for the review frames.
  isPreviewOpen?: boolean;
  TagElement?: React.ComponentType<OnboardingTagProps>;
  onContinue: () => void;
}

// The onboarding branch of `EditTag` inside `FunnelEditTags`, copied so each
// variant can swap only the preview and keep the rest of the step identical.
export const TagStepFrame = ({
  header,
  children,
  docked,
  aside,
  isPreviewOpen,
  TagElement,
  onContinue,
}: TagStepFrameProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isReady } = usePickedTags();
  const [searchQuery, setSearchQuery] = useState('');
  const [onSearch] = useDebounceFn((value?: string) => {
    setSearchQuery(value ?? '');
  }, 350);
  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.EditTag,
  });
  const hasAside = !!aside && isLaptop;
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPreviewOpen) {
      return undefined;
    }

    const timeout = setTimeout(
      () => previewRef.current?.scrollIntoView({ block: 'start' }),
      600,
    );

    return () => clearTimeout(timeout);
  }, [isPreviewOpen]);

  const tags = (
    <div className="flex w-full flex-col items-center gap-6">
      {header ?? (
        <OnboardingHeadline>
          Pick tags that are relevant to you
        </OnboardingHeadline>
      )}
      <div className="flex w-full flex-col items-center">
        <TagSelection
          TagElement={TagElement}
          className="max-w-4xl"
          classNameTags="!gap-2"
          searchElement={
            <SearchField
              aria-label="Pick tags that are relevant to you"
              autoFocus={!isMobile}
              className="mb-10 w-full max-w-[27.5rem]"
              isFloating
              inputId="search-filters"
              placeholder="Search javascript, php, git, etc…"
              valueChanged={onSearch}
            />
          }
          searchQuery={searchQuery}
          searchTags={searchResult?.searchTags.tags || []}
        />
      </div>
      {!!children && (
        <div
          ref={previewRef}
          className="flex w-full scroll-mt-6 flex-col items-center gap-6"
        >
          {children}
        </div>
      )}
    </div>
  );

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: 'Continue' }}
      disabled={!isReady}
      docked={docked}
      onClick={onContinue}
      // `overflow-clip`, not production's `overflow-hidden`: a hidden overflow
      // makes this a scroll container and the split view's sticky column
      // would never stick.
      containerClassName="flex w-full flex-1 flex-col items-center overflow-clip"
    >
      <div
        className={classNames(
          funnelStepRail,
          'py-6 pt-3 laptop:max-w-screen-laptop',
          hasAside
            ? 'grid grid-cols-[minmax(0,1fr)_24rem] items-start gap-10'
            : 'flex flex-col items-center gap-6',
        )}
      >
        {tags}
        {hasAside && aside}
      </div>
    </FunnelStepCtaWrapper>
  );
};

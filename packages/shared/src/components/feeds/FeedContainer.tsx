import React, { ReactElement, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Spaciness } from '../../graphql/settings';
import SettingsContext from '../../contexts/SettingsContext';
import { useFeedLayout, ToastSubject, useToastNotification } from '../../hooks';
import { useActiveFeedContext } from '../../contexts';

export interface FeedContainerProps {
  children: ReactNode;
  forceCardMode?: boolean;
  header?: ReactNode;
  className?: string;
  inlineHeader?: boolean;
  showSearch?: boolean;
  shortcuts?: ReactNode;
  actionButtons?: ReactNode;
}

const listGaps = {
  cozy: 'gap-5',
  roomy: 'gap-3',
};

const gridGaps = {
  cozy: 'gap-14',
  roomy: 'gap-12',
};

export const getFeedGapPx = {
  'gap-2': 8,
  'gap-3': 12,
  'gap-5': 20,
  'gap-8': 32,
  'gap-12': 48,
  'gap-14': 56,
};

export const gapClass = (
  isList: boolean,
  isFeedLayoutV1: boolean,
  space: Spaciness,
): string => {
  if (isFeedLayoutV1) {
    return '';
  }
  return isList ? listGaps[space] ?? 'gap-2' : gridGaps[space] ?? 'gap-8';
};

export const FeedContainer = ({
  children,
  className,
  showSearch,
}: FeedContainerProps): ReactElement => {
  const { subject } = useToastNotification();
  const {
    spaciness,
    insaneMode: listMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const { feedRef } = useActiveFeedContext();
  const router = useRouter();
  const isFinder = router.pathname === '/search/posts';
  const isSearch = showSearch && !isFinder;

  if (!loadedSettings) {
    return <></>;
  }

  const gap = (space: Spaciness) => {
    switch (space) {
      case 'cozy':
        return 'gap-14';
      case 'roomy':
        return 'gap-12';
      default:
        return 'gap-8';
    }
  };

  const containerHorizontalPadding = (space: Spaciness) => {
    switch (space) {
      case 'cozy':
        return 'px-16';
      case 'roomy':
        return 'px-18';
      default:
        return 'px-20';
    }
  };

  const containerVerticalPadding = (space: Spaciness) => {
    switch (space) {
      case 'cozy':
        return 'py-6';
      case 'roomy':
        return 'py-8';
      default:
        return 'py-10';
    }
  };

  return (
    <div
      className={classNames(
        'relative flex w-full flex-col laptopL:mx-auto',
        className,
      )}
    >
      <div className="flex w-full flex-col laptopL:mx-auto">
        <div>Injection area for outside feed wrapper</div>
        <div
          className={classNames(
            'relative mx-auto w-full',
            containerVerticalPadding(spaciness),
            containerHorizontalPadding(spaciness),
          )}
          aria-live={subject === ToastSubject.Feed ? 'assertive' : 'off'}
          data-testid="posts-feed"
        >
          <div
            className={classNames(
              'grid grid-flow-row auto-rows-auto grid-cols-[repeat(auto-fit,_minmax(272px,_320px))] items-center justify-center',
              gap(spaciness),
              isSearch && !shouldUseMobileFeedLayout && 'mt-8',
            )}
            ref={feedRef}
          >
            <div className="col-span-full">
              Injection area for inside feed wrapper
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

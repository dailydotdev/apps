import React, { ReactElement, useEffect, useState } from 'react';
import sizeN from '../macros/sizeN.macro';
import ArrowIcon from '../icons/arrow.svg';
import classNames from 'classnames';
import { getTooltipProps } from '../lib/tooltip';
import FeedFilters from './filters/FeedFilters';

const asideWidth = sizeN(89);

export default function Sidebar(): ReactElement {
  const [opened, setOpened] = useState(false);
  const [enableQueries, setEnableQueries] = useState(false);

  useEffect(() => {
    if (opened && !enableQueries) {
      setTimeout(() => {
        setEnableQueries(true);
      }, 300);
    }
  }, [opened]);

  return (
    <div
      className={classNames(
        'fixed flex items-start top-0 left-0 h-full z-3 pointer-events-none',
        { opened },
      )}
      style={{
        transform: opened ? 'translateX(0)' : `translateX(-${asideWidth})`,
        willChange: 'transform',
        transition: 'transform 0.2s linear 0.1s',
      }}
    >
      <aside
        className={classNames(
          'scrollbar overflow-y-scroll self-stretch bg-theme-bg-primary rounded-r-2xl border-r border-theme-divider-primary',
          !opened && 'invisible',
        )}
        style={{
          width: asideWidth,
          transition: 'visibility 0s',
          pointerEvents: 'all',
          transitionDelay: opened ? '0s' : '0.3s',
        }}
      >
        <FeedFilters enableQueries={enableQueries} />
      </aside>
      <button
        className={classNames(
          'flex w-12 h-14 items-center mt-24 pl-3 bg-theme-bg-primary border border-l-0 rounded-r-2xl cursor-pointer focus-outline hover:text-theme-label-primary',
          opened
            ? 'text-theme-label-primary border-theme-divider-primary'
            : 'text-theme-label-tertiary border-theme-divider-quaternary',
        )}
        style={{ fontSize: '1.75rem', pointerEvents: 'all' }}
        {...getTooltipProps('Open sidebar', { position: 'right' })}
        onClick={() => setOpened(!opened)}
      >
        <ArrowIcon
          style={{
            transform: opened ? 'rotate(270deg)' : 'rotate(90deg)',
            transition: 'transform 0.2s linear 0.1s',
          }}
        />
      </button>
    </div>
  );
}

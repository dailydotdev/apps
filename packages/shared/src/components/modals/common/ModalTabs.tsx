import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { ModalPropsContext } from './types';

export function ModalTabs(): ReactElement {
  const { activeTab, onTabChange, tabs } = useContext(ModalPropsContext);
  return (
    <ul className="flex flex-row gap-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={classNames(
            'relative py-1.5 px-3 text-center typo-callout rounded-6',
            tab === activeTab
              ? 'bg-theme-bg-pepper font-bold'
              : 'text-theme-label-tertiary',
          )}
          onClick={() => onTabChange(tab)}
          type="button"
          role="menuitem"
        >
          {tab}
          {tab === activeTab && (
            <div
              className="absolute mx-auto w-4 h-px bg-theme-label-primary"
              style={{ bottom: '-0.75rem', left: 'calc(50% - 0.5rem)' }}
            />
          )}
        </button>
      ))}
    </ul>
  );
}

import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { ModalPropsContext, ModalTabItem, modalTabTitle } from './types';

export function ModalTabs(): ReactElement {
  const { activeTab, setActiveTab, tabs } = useContext(ModalPropsContext);
  return (
    <ul className="flex flex-row gap-4">
      {tabs.map((tab: string | ModalTabItem) => {
        const tabTitle = modalTabTitle(tab);
        return (
          <button
            key={tabTitle}
            className={classNames(
              'relative py-1.5 px-3 text-center typo-callout rounded-6',
              tab === activeTab
                ? 'bg-theme-bg-pepper font-bold'
                : 'text-theme-label-tertiary',
            )}
            onClick={() => setActiveTab(tabTitle)}
            type="button"
            role="menuitem"
          >
            {tabTitle}
            {tabTitle === activeTab && (
              <div
                className="absolute mx-auto w-4 h-px bg-theme-label-primary"
                style={{ bottom: '-0.75rem', left: 'calc(50% - 0.5rem)' }}
              />
            )}
          </button>
        );
      })}
    </ul>
  );
}

import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { ModalPropsContext, ModalTabItem, modalTabTitle } from './types';

export type ModalTabsProps = {
  disabledTab?: (tab: string) => boolean;
  onTabClick?: (tab: string) => void;
};

export function ModalTabs({
  disabledTab,
  onTabClick,
}: ModalTabsProps): ReactElement {
  const { activeView, setActiveView, tabs } = useContext(ModalPropsContext);
  const onClick = (tab: string) => {
    setActiveView(tab);
    onTabClick?.(tab);
  };

  return (
    <ul className="flex flex-row gap-4">
      {tabs.map((tab: string | ModalTabItem) => {
        const tabTitle = modalTabTitle(tab);
        const disabled = !!disabledTab?.(tabTitle);
        return (
          <button
            disabled={disabled}
            key={tabTitle}
            className={classNames(
              'btn relative h-8 rounded-10 px-3 py-1.5 text-center typo-callout',
              disabled && 'opacity-64',
              tab === activeView
                ? 'bg-theme-active font-bold'
                : 'text-text-tertiary',
            )}
            onClick={() => onClick(tabTitle)}
            type="button"
            role="menuitem"
          >
            {tabTitle}
            {tabTitle === activeView && (
              <div
                className="absolute mx-auto h-px w-4 bg-text-primary"
                style={{ bottom: '-0.75rem', left: 'calc(50% - 0.5rem)' }}
              />
            )}
          </button>
        );
      })}
    </ul>
  );
}

import React, { ReactElement, ReactNode, useState } from 'react';
import TabList from './TabList';

export interface TabProps {
  label: string;
  content: ReactNode;
}

interface TabContainerProps {
  tabs: TabProps[];
  initiallyActive?: number;
  onActiveChange?: (active: number) => unknown;
}

function TabContainer({
  initiallyActive = 0,
  tabs,
  onActiveChange,
}: TabContainerProps): ReactElement {
  const [active, setActive] = useState(initiallyActive);
  const onClick = (index: number) => {
    setActive(index);
    onActiveChange(index);
  };

  return (
    <div className="flex flex-col">
      <header className="flex flex-row border-b border-theme-divider-tertiary">
        <TabList
          items={tabs.map((tab) => tab.label)}
          onClick={onClick}
          active={active}
        />
      </header>
      <main className="p-3" style={{ minHeight: '11rem' }}>
        {tabs.find((_, index) => index === active)?.content}
      </main>
    </div>
  );
}

export default TabContainer;

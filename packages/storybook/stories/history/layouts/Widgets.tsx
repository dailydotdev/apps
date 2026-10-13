import type { ReactElement } from 'react';
import React from 'react';
import { useFilters } from '../controls';
import { StreakWidget, WeekWidget } from '../recap';
import { ReadingOverviewWidget } from '../overviewWidget';
import { ListCard, SidebarFrame } from './SidebarFrame';

// The list in production's squads discover frame, with the reading streak,
// your week in reading and the profile's Reading Overview in the widget
// column beside it.

export const Widgets = (): ReactElement => {
  const state = useFilters();
  return (
    <div className="flex min-h-full flex-col">
      <SidebarFrame
        aside={
          <>
            <StreakWidget />
            <WeekWidget state={state} />
            <ReadingOverviewWidget />
          </>
        }
      >
        <ListCard state={state} />
      </SidebarFrame>
    </div>
  );
};

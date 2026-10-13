import type { ReactElement } from 'react';
import React from 'react';
import { useFilters } from '../controls';
import { ListCard, SidebarFrame } from './SidebarFrame';

// Videos first: each day opens with the videos you watched as a row of
// big cards, image first, then the day's articles in the usual list. A
// video is remembered by its thumbnail, an article by its title. Same
// bordered card as the other layouts, without the widget column.

export const VideosFirst = (): ReactElement => {
  const state = useFilters();
  return (
    <div className="flex min-h-full flex-col">
      <SidebarFrame>
        <ListCard state={state} videosFirst />
      </SidebarFrame>
    </div>
  );
};

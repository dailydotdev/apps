import React, { ReactElement } from 'react';
import classed from '../../lib/classed';

const PlaceholderElement = classed('div', 'bg-theme-float');
const RectangleElement = classed(PlaceholderElement, 'rounded-12');

function SquadLoading(): ReactElement {
  return (
    <div className="flex overflow-hidden flex-col items-center pt-6 w-full max-h-[calc(100vh-3.5rem)]">
      <PlaceholderElement className="w-24 h-24 rounded-full" />
      <RectangleElement className="mt-6 h-5 w-[30rem]" />
      <RectangleElement className="mt-4 w-52 h-5" />
      <div className="flex flex-row gap-3 mt-20">
        <RectangleElement className="w-40 h-10" />
        <RectangleElement className="w-40 h-10" />
        <RectangleElement className="w-10 h-10" />
      </div>
      <div className="mt-28 ml-20 w-full">
        <RectangleElement className="w-64 h-96" />
      </div>
    </div>
  );
}

export default SquadLoading;

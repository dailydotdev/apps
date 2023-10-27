import React, { ReactElement } from 'react';
import { useActiveFeedContext } from '../../contexts';

function LeanFeed({ children }): ReactElement {
  const { feedRef } = useActiveFeedContext();

  return (
    <div className="grid grid-cols-2 gap-4" ref={feedRef}>
      {children}
    </div>
  );
}

export default LeanFeed;

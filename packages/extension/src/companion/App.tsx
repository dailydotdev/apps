import React, { ReactElement } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

export default function App({ postData }): ReactElement {
  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: '7.5rem',
        zIndex: 999,
      }}
    >
      <p>Upvotes:</p>
      <p>{postData?.numUpvotes}</p>
      <p>Comments:</p>
      <p>{postData?.numComments}</p>
      <Button className="btn-tertiary">Add shortcuts</Button>
    </div>
  );
}

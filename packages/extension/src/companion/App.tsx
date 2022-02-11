import React, { ReactElement } from 'react';

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
    </div>
  );
}

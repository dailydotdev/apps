import React, { ReactElement } from 'react';

function OrDivider(): ReactElement {
  return (
    <div className="flex relative justify-center mt-3 w-full">
      <span className="absolute top-1/2 z-0 w-full h-px bg-theme-divider-tertiary" />
      <div className="z-1 px-3 bg-theme-bg-tertiary">or</div>
    </div>
  );
}

export default OrDivider;

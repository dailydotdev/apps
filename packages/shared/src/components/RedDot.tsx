import React, { ReactElement } from 'react';

export default function RedDot(): ReactElement {
  return (
    <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-theme-status-error" />
  );
}

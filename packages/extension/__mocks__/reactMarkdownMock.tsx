import type { ReactElement, ReactNode } from 'react';
import React from 'react';

const ReactMarkdown = ({
  children,
}: {
  children?: ReactNode;
}): ReactElement => {
  return <>{children}</>;
};

export default ReactMarkdown;

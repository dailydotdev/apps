import React, { ReactElement, ReactNode } from 'react';

const ReactMarkdown = ({
  children,
}: {
  children?: ReactNode;
}): ReactElement => {
  return <>{children}</>;
};

export default ReactMarkdown;

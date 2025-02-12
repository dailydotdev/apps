import type { ReactElement, ReactNode } from 'react';

interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: (children: ReactNode) => ReactElement;
  children: ReactNode;
}
const ConditionalWrapper = ({
  condition,
  wrapper,
  children,
}: ConditionalWrapperProps): ReactElement =>
  condition ? wrapper(children) : (children as ReactElement);

export default ConditionalWrapper;

export const ConditionalRender = ({
  condition,
  children,
}: Pick<ConditionalWrapperProps, 'condition' | 'children'>): ReactNode => {
  if (!condition) {
    return null;
  }

  return children;
};

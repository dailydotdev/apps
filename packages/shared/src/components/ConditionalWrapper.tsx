import { ReactElement } from 'react';

export interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: (children: ReactElement) => ReactElement;
  children: ReactElement;
}
const ConditionalWrapper = ({
  condition,
  wrapper,
  children,
}: ConditionalWrapperProps): ReactElement =>
  condition ? wrapper(children) : children;

export default ConditionalWrapper;

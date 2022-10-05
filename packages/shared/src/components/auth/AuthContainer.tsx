import classNames from 'classnames';
import React, {
  forwardRef,
  HTMLAttributes,
  MutableRefObject,
  useContext,
} from 'react';
import FeaturesContext from '../../contexts/FeaturesContext';
import classed from '../../lib/classed';
import { AuthVersion } from '../../lib/featureValues';

const Container = classed(
  'div',
  'grid grid-cols-1 gap-3 self-center mt-6 w-full',
);

function AuthContainer(
  { className, children, ...props }: HTMLAttributes<HTMLDivElement>,
  ref: MutableRefObject<HTMLDivElement>,
) {
  const { authVersion } = useContext(FeaturesContext);

  return (
    <Container
      {...props}
      ref={ref}
      className={classNames(
        className,
        authVersion === AuthVersion.V2
          ? 'max-w-[20rem]'
          : 'px-6 tablet:px-[3.75rem]',
      )}
    >
      {children}
    </Container>
  );
}

export default forwardRef(AuthContainer);

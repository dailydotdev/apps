import classNames from 'classnames';
import React, { forwardRef, HTMLAttributes, MutableRefObject } from 'react';
import classed from '../../lib/classed';

const Container = classed('div', 'flex flex-col gap-3 self-center mt-6 w-full');

function AuthContainer(
  { className, children, ...props }: HTMLAttributes<HTMLDivElement>,
  ref: MutableRefObject<HTMLDivElement>,
) {
  return (
    <Container
      {...props}
      ref={ref}
      className={classNames(className, 'px-6 tablet:px-[3.75rem]')}
    >
      {children}
    </Container>
  );
}

export default forwardRef(AuthContainer);

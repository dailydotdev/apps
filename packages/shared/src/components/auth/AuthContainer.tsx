import classNames from 'classnames';
import type { HTMLAttributes, MutableRefObject } from 'react';
import React, { forwardRef } from 'react';
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
      className={classNames(className, 'tablet:px-[3.75rem] px-6')}
    >
      {children}
    </Container>
  );
}

export default forwardRef(AuthContainer);

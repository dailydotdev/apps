import classNames from 'classnames';
import React, {
  FormHTMLAttributes,
  forwardRef,
  MutableRefObject,
  ReactElement,
} from 'react';

function AuthForm(
  { children, className, ...props }: FormHTMLAttributes<HTMLFormElement>,
  ref: MutableRefObject<HTMLFormElement>,
): ReactElement {
  return (
    <form
      {...props}
      ref={ref}
      className={classNames('grid grid-cols-1', className)}
    >
      {children}
    </form>
  );
}

export default forwardRef(AuthForm);

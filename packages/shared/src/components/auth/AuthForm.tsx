import classNames from 'classnames';
import React, {
  FormHTMLAttributes,
  forwardRef,
  MutableRefObject,
  ReactElement,
  useContext,
} from 'react';
import FeaturesContext from '../../contexts/FeaturesContext';
import { AuthVersion } from '../../lib/featureValues';

function AuthForm(
  { children, className, ...props }: FormHTMLAttributes<HTMLFormElement>,
  ref: MutableRefObject<HTMLFormElement>,
): ReactElement {
  const { authVersion } = useContext(FeaturesContext);

  return (
    <form
      {...props}
      ref={ref}
      className={classNames(
        'grid grid-cols-1',
        authVersion === AuthVersion.V2 && 'px-4',
        className,
      )}
    >
      {children}
    </form>
  );
}

export default forwardRef(AuthForm);

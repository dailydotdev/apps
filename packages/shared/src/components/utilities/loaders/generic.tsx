import { ReactElement } from 'react';
import { LoaderIcon } from '../../icons';
import { IconSize } from '../../Icon';
import classnames from 'classnames';

interface Props {
  className?: string;
  label?: string;
}

export const GenericLoader = ({
  className,
  label = 'Preparing...',
}: Props): ReactElement => {
  return (
    <div className="fixed inset-0 bg-background-default z-modal flex justify-center items-center">
      <div className="flex flex-col gap-5 items-center">
        <LoaderIcon
          size={IconSize.XLarge}
          className={classnames(
            className,
            'flex-shrink-0 drop-shadow-[0_0_5px_#CE3DE3] animate-spin',
          )}
        />
        <div>{label}</div>
      </div>
    </div>
  );
};

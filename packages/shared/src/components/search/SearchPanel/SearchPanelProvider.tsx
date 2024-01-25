import React, { FunctionComponent, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import { IconProps, IconSize } from '../../Icon';
import { MagicIcon } from '../../icons';
import { SearchPanelContext } from './SearchPanelContext';

export type SearchPanelProviderProps = {
  className?: string;
};

const providerToComponentMap: Record<
  SearchProviderEnum,
  FunctionComponent<IconProps> | undefined
> = {
  [SearchProviderEnum.Posts]: undefined,
  [SearchProviderEnum.Chat]: ({ className, ...rest }: IconProps) => (
    <MagicIcon
      className={classNames(
        className,
        'rounded-8 bg-gradient-to-t from-onion-40 to-cabbage-40 p-1 text-white',
      )}
      secondary
      {...rest}
    />
  ),
};

export const SearchPanelProvider = ({
  className,
}: SearchPanelProviderProps): ReactElement => {
  const searchPanel = useContext(SearchPanelContext);
  const Component = providerToComponentMap[searchPanel.provider];

  if (!Component) {
    return null;
  }

  return <Component className={classNames(className)} size={IconSize.Large} />;
};

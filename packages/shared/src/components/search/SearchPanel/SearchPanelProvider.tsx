import React, { FunctionComponent, ReactElement } from 'react';
import classNames from 'classnames';
import { SearchProviderEnum } from '../../../graphql/search';
import { IconProps, IconSize } from '../../Icon';
import { MagicIcon } from '../../icons';

export type SearchPanelProviderProps = {
  className?: string;
  provider: SearchProviderEnum;
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
  provider,
}: SearchPanelProviderProps): ReactElement => {
  const Component = providerToComponentMap[provider];

  if (!Component) {
    return null;
  }

  return <Component className={classNames(className)} size={IconSize.Large} />;
};

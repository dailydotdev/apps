import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { TagLinks } from '../../TagLinks';
import { ButtonVariant } from '../../buttons/common';
import SourceButton from '../../cards/SourceButton';
import Logo, { LogoPosition } from '../../Logo';
import { DevCardTheme, DevCardType } from './common';
import { Source } from '../../../graphql/sources';

export interface DevCardFooterProps {
  tags: string[];
  sources: Source[];
  type: DevCardType;
  theme: DevCardTheme;
  shouldShowLogo?: boolean;
  tagsClickable?: boolean;
}

export function DevCardFooter({
  type,
  tags,
  sources,
  theme,
  shouldShowLogo = true,
  tagsClickable = true,
}: DevCardFooterProps): ReactElement {
  return (
    <>
      <TagLinks
        buttonProps={{ variant: ButtonVariant.Secondary }}
        className={{
          container: classNames(
            'max-h-[3.5rem] overflow-hidden',
            type === DevCardType.Horizontal && 'pb-3',
            !shouldShowLogo && 'justify-center px-2',
            !tagsClickable && 'pointer-events-none',
          ),
          tag: classNames(
            'typo-caption1',
            theme === DevCardTheme.Iron
              ? 'border-white text-white'
              : 'border-pepper-90 text-pepper-90',
            type === DevCardType.Vertical && '!leading-[1.375rem]',
          ),
        }}
        tags={tags}
      />
      <div className="flex h-6 flex-row gap-1">
        {sources?.map((source) => (
          <SourceButton key={source.name} source={source} size="small" />
        ))}
      </div>
      {shouldShowLogo && (
        <span className="absolute bottom-0 right-0 rounded-br-24 rounded-tl-24 bg-pepper-90 px-4 py-3">
          <Logo showGreeting={false} position={LogoPosition.Relative} />
        </span>
      )}
    </>
  );
}

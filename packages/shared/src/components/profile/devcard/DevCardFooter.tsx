import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { TagLinks } from '../../TagLinks';
import { ButtonVariant } from '../../buttons/common';
import SourceButton from '../../cards/SourceButton';
import Logo, { LogoPosition } from '../../Logo';
import { DevCardTheme, DevCardType } from './common';
import { Source } from '../../../graphql/sources';
import { checkLowercaseEquality } from '../../../lib/strings';
import { ProfileImageSize } from '../../ProfilePicture';

export interface DevCardFooterProps {
  tags: string[];
  sources: Source[];
  type: DevCardType;
  theme: DevCardTheme;
  shouldShowLogo?: boolean;
  elementsClickable?: boolean;
}

export function DevCardFooter({
  type,
  tags,
  sources,
  theme,
  shouldShowLogo = true,
  elementsClickable = true,
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
            !elementsClickable && 'pointer-events-none',
          ),
          tag: classNames(
            '!shadow-none typo-caption1',
            checkLowercaseEquality(theme, DevCardTheme.Iron)
              ? 'border-white text-white'
              : 'border-raw-pepper-90 text-raw-pepper-90',
            type === DevCardType.Vertical && '!leading-[1.375rem]',
          ),
        }}
        tags={tags}
      />
      <div
        className={classNames(
          'flex h-6 flex-row gap-1',
          !elementsClickable && 'pointer-events-none',
        )}
      >
        {sources?.map((source) => (
          <SourceButton
            key={source.name}
            source={source}
            size={ProfileImageSize.Small}
          />
        ))}
      </div>
      {shouldShowLogo && (
        <span
          className={classNames(
            'absolute bottom-0 right-0 rounded-br-24 rounded-tl-24 bg-raw-pepper-90 px-4 py-3',
            !elementsClickable && 'pointer-events-none',
          )}
        >
          <Logo
            showGreeting={false}
            position={LogoPosition.Relative}
            logoClassName={{
              group: 'fill-raw-salt-0',
              container: 'h-logo',
            }}
          />
        </span>
      )}
    </>
  );
}

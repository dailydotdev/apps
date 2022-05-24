import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import classed from '@dailydotdev/shared/src/lib/classed';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import React, { ReactElement, Ref, forwardRef, useContext } from 'react';
import PlayIcon from '@dailydotdev/shared/icons/filled/play.svg';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import {
  Features,
  getFeatureValue,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { useExtensionPermission } from './useExtensionPermission';

const CompanionSection = classed('div', 'flex flex-col max-w-full');

const CompanionPermissionComponent = (
  _,
  ref: Ref<HTMLDivElement>,
): ReactElement => {
  const { registerContentScripts } = useExtensionPermission();
  const { flags } = useContext(FeaturesContext);
  const link = getFeatureValue(Features.CompanionPermissionLink, flags);
  const button = getFeatureValue(Features.CompanionPermissionButton, flags);
  const title = getFeatureValue(Features.CompanionPermissionTitle, flags);
  const description = getFeatureValue(
    Features.CompanionPermissionDescription,
    flags,
  );

  return (
    <div ref={ref} className="flex flex-row gap-4 max-w-full typo-callout">
      <CompanionSection className="shrink">
        <p className="font-bold" data-testid="companion_permission_title">
          {title}
        </p>
        <p
          className="my-2 text-theme-label-tertiary"
          data-testid="companion_permission_description"
        >
          {description}
        </p>
        <Button
          className="mt-1 w-[12.5rem] btn btn-primary"
          onClick={registerContentScripts}
          buttonSize="small"
        >
          {button}
        </Button>
      </CompanionSection>
      <CompanionSection>
        <a
          href={companionExplainerVideo}
          className="flex relative justify-center items-center"
        >
          <img
            src="./companion_preview.png"
            alt="Companion video preview"
            className="rounded-10 w-[11.25rem] h-[6.875]"
          />
          <PlayIcon className="absolute w-10 h-10" />
        </a>
        <a
          href={companionExplainerVideo}
          className="mt-2 text-center underline typo-footnote text-theme-status-cabbage"
        >
          {link}
        </a>
      </CompanionSection>
    </div>
  );
};

export const CompanionPermission = forwardRef(CompanionPermissionComponent);

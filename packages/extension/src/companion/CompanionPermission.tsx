import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import classed from '@dailydotdev/shared/src/lib/classed';
import React, { ReactElement, Ref, forwardRef, useContext } from 'react';
import PlayIcon from '@dailydotdev/shared/icons/filled/play.svg';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
import {
  Features,
  getFeatureValue,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { useExtensionPermission } from './useExtensionPermission';

interface Content {
  title: string;
  description: string;
}

const contentVariation: Record<string, Content> = {
  v1: {
    title:
      'The companion lets you comment and upvote directly on an article! 🤯',
    description:
      'Heads up! We need to ask for some extra permissions so you can enjoy the power of the companion.',
  },
  v2: {
    title: 'Add TLDR and more information on the article',
    description:
      'By adding the widget to an article, it asks permission to track website visits.',
  },
  v3: {
    title: 'Stay updated with our community inside articles',
    description:
      'By adding the widget to an article, it asks permission to track website visits.',
  },
};

const CompanionSection = classed('div', 'flex flex-col max-w-full');

const CompanionPermissionComponent = (
  _,
  ref: Ref<HTMLDivElement>,
): ReactElement => {
  const { registerContentScripts } = useExtensionPermission();
  const { flags } = useContext(FeaturesContext);
  const contentVersion = getFeatureValue(
    Features.CompanionPermissionContent,
    flags,
  );
  const content = contentVariation[contentVersion];

  return (
    <div ref={ref} className="flex flex-row gap-4 max-w-full typo-callout">
      <CompanionSection className="shrink">
        <p className="font-bold">{content?.title}</p>
        <p className="my-2 text-theme-label-tertiary">{content?.description}</p>
        <Button
          className="mt-1 w-[12.5rem] btn btn-primary"
          onClick={registerContentScripts}
          buttonSize="small"
        >
          Add the companion now!
        </Button>
      </CompanionSection>
      <CompanionSection>
        <a className="flex relative justify-center items-center" href="#">
          <img
            src="./companion_preview.png"
            alt="Companion video preview"
            className="rounded-10 w-[11.25rem] h-[6.875]"
          />
          <PlayIcon className="absolute w-10 h-10" />
        </a>
        <a
          href="#"
          className="mt-2 text-center underline typo-footnote text-theme-status-cabbage"
        >
          Watch the Companion
          <br />
          Overview
        </a>
      </CompanionSection>
    </div>
  );
};

export const CompanionPermission = forwardRef(CompanionPermissionComponent);

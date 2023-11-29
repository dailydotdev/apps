import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import classed from '@dailydotdev/shared/src/lib/classed';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import React, { ReactElement, Ref, forwardRef } from 'react';
import PlayIcon from '@dailydotdev/shared/src/components/icons/Play';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { useExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';

const CompanionSection = classed('div', 'flex flex-col max-w-full');

const CompanionPermissionComponent = (
  _,
  ref: Ref<HTMLDivElement>,
): ReactElement => {
  const { requestContentScripts } = useExtensionContext();
  const link = 'Overview Video';
  const button = 'Activate companion';
  const title = 'Try the new companion feature!';
  const description =
    "We'll ask for extra permissions so we can show the companion directly on the original content!";

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
          onClick={() =>
            requestContentScripts({
              origin: 'companion permission popup',
            })
          }
          buttonSize={ButtonSize.Small}
        >
          {button}
        </Button>
      </CompanionSection>
      <CompanionSection>
        <a
          target="_blank"
          href={companionExplainerVideo}
          className="flex relative justify-center items-center"
        >
          <img
            src="https://daily-now-res.cloudinary.com/image/upload/v1655218347/public/companion_preview_v2.png"
            alt="Companion video preview"
            className="rounded-10 w-[11.25rem] h-[6.875]"
          />
          <PlayIcon secondary className="absolute w-10 h-10" />
        </a>
        <ClickableText
          tag="a"
          target="_blank"
          defaultTypo={false}
          href={companionExplainerVideo}
          className="mx-auto mt-2 text-center"
          textClassName="text-theme-status-cabbage typo-footnote"
        >
          {link}
        </ClickableText>
      </CompanionSection>
    </div>
  );
};

export const CompanionPermission = forwardRef(CompanionPermissionComponent);

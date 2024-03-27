import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import classed from '@dailydotdev/shared/src/lib/classed';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import React, { forwardRef, ReactElement, Ref } from 'react';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import { useExtensionContext } from '@dailydotdev/shared/src/contexts/ExtensionContext';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

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
    <div ref={ref} className="flex max-w-full flex-row gap-4 typo-callout">
      <CompanionSection className="shrink">
        <p className="font-bold" data-testid="companion_permission_title">
          {title}
        </p>
        <p
          className="my-2 text-text-tertiary"
          data-testid="companion_permission_description"
        >
          {description}
        </p>
        <Button
          className="mt-1 w-[12.5rem]"
          onClick={() =>
            requestContentScripts({
              origin: 'companion permission popup',
            })
          }
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
        >
          {button}
        </Button>
      </CompanionSection>
      <CompanionSection>
        <a
          target="_blank"
          href={companionExplainerVideo}
          className="relative flex items-center justify-center"
        >
          <img
            src="https://daily-now-res.cloudinary.com/image/upload/v1655218347/public/companion_preview_v2.png"
            alt="Companion video preview"
            className="h-[6.875] w-[11.25rem] rounded-10"
          />
          <PlayIcon secondary className="absolute" size={IconSize.XLarge} />
        </a>
        <ClickableText
          tag="a"
          target="_blank"
          defaultTypo={false}
          href={companionExplainerVideo}
          className="mx-auto mt-2 text-center"
          textClassName="text-accent-cabbage-default typo-footnote"
        >
          {link}
        </ClickableText>
      </CompanionSection>
    </div>
  );
};

export const CompanionPermission = forwardRef(CompanionPermissionComponent);

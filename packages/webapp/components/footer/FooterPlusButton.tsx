import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import type { DrawerRef } from '@dailydotdev/shared/src/components/drawers';
import { Drawer } from '@dailydotdev/shared/src/components/drawers';
import type {
  AllowedTags,
  ButtonV2Props,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import {
  ButtonV2,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import {
  EditIcon,
  LinkIcon,
  PlusIcon,
  PollIcon,
} from '@dailydotdev/shared/src/components/icons';
import { link } from '@dailydotdev/shared/src/lib/links';
import { RootPortal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

const ActionButton = <TagName extends AllowedTags>({
  children,
  ...props
}: ButtonV2Props<TagName>) => {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <ButtonV2
        {...props}
        size={ButtonSize.Large}
        variant={ButtonVariant.Float}
      />
      <span className="font-normal text-text-tertiary typo-callout">
        {children}
      </span>
    </div>
  );
};

interface FooterPlusButtonProps {
  className?: string;
}

export function FooterPlusButton({
  className,
}: FooterPlusButtonProps): ReactElement {
  const { user } = useAuthContext();
  const drawerRef = useRef<DrawerRef>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const props = user
    ? { onClick: () => setIsDrawerOpen(true) }
    : { tag: 'a' as AllowedTags, href: '/onboarding' };

  return (
    <>
      <ButtonV2
        {...props}
        icon={<PlusIcon />}
        variant={ButtonVariant.Primary}
        className={classNames(
          'border border-border-subtlest-tertiary',
          className,
        )}
      />
      <RootPortal>
        <Drawer
          ref={drawerRef}
          displayCloseButton
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <div className="mb-1 flex h-auto justify-around">
            <ActionButton tag="a" icon={<EditIcon />} href={link.post.create}>
              New post
            </ActionButton>
            <ActionButton
              tag="a"
              icon={<LinkIcon />}
              href={`${link.post.create}?share=true`}
            >
              Share a link
            </ActionButton>
            <ActionButton
              tag="a"
              icon={<PollIcon />}
              href={`${link.post.create}?poll=true`}
            >
              Poll
            </ActionButton>
          </div>
        </Drawer>
      </RootPortal>
    </>
  );
}

import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import type { DrawerRef } from '@dailydotdev/shared/src/components/drawers';
import { Drawer } from '@dailydotdev/shared/src/components/drawers';
import type {
  AllowedTags,
  ButtonProps,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  DocsIcon,
  EditIcon,
  LinkIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { link } from '@dailydotdev/shared/src/lib/links';
import { RootPortal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';

const ActionButton = <TagName extends AllowedTags>({
  children,
  ...props
}: ButtonProps<TagName>) => {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <Button
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

export function FooterPlusButton(): ReactElement {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const drawerRef = useRef<DrawerRef>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const props = user
    ? { onClick: () => setIsDrawerOpen(true) }
    : { tag: 'a' as AllowedTags, href: '/onboarding' };

  return (
    <>
      <Button
        {...props}
        icon={<PlusIcon />}
        variant={ButtonVariant.Float}
        className="z-1 justify-self-center border border-border-subtlest-tertiary"
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
              icon={<DocsIcon />}
              onClick={() => {
                drawerRef?.current?.onClose();
                openModal({ type: LazyModal.SubmitArticle });
              }}
            >
              Community picks
            </ActionButton>
          </div>
        </Drawer>
      </RootPortal>
    </>
  );
}

import React, { ReactElement, useState } from 'react';
import { Drawer } from '@dailydotdev/shared/src/components/drawers';
import {
  AllowedTags,
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  EditIcon,
  LinkIcon,
  PlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { link } from '@dailydotdev/shared/src/lib/links';
import { RootPortal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';

export function FooterPlusButton(): ReactElement {
  const { user } = useAuthContext();
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
        className="z-1 border border-border-subtlest-tertiary"
      />
      <RootPortal>
        <Drawer
          displayCloseButton
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <div className="flex h-auto justify-around p-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                size={ButtonSize.XLarge}
                icon={<EditIcon />}
                variant={ButtonVariant.Float}
                tag="a"
                href={link.post.create}
              />

              <span className="font-normal text-text-tertiary">New post</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                size={ButtonSize.XLarge}
                className="flex flex-col"
                tag="a"
                variant={ButtonVariant.Float}
                href={`${link.post.create}?share=true`}
                icon={<LinkIcon />}
              />

              <span className="font-normal text-text-tertiary">
                Share a link
              </span>
            </div>
          </div>
        </Drawer>
      </RootPortal>
    </>
  );
}

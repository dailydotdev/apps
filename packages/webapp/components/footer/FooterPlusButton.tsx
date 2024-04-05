import React, { ReactElement, useState } from 'react';
import { Drawer } from '@dailydotdev/shared/src/components/drawers';
import {
  AllowedTags,
  Button,
  ButtonProps,
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
    <div className="flex flex-col items-center gap-2">
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
              onClick={() => openModal({ type: LazyModal.SubmitArticle })}
            >
              Submit article
            </ActionButton>
          </div>
        </Drawer>
      </RootPortal>
    </>
  );
}

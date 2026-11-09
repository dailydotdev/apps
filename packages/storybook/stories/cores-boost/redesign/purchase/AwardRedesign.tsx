import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { Modal } from '@dailydotdev/shared/src/components/modals/common/Modal';
import { ModalKind } from '@dailydotdev/shared/src/components/modals/common/types';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import MarkdownInput from '@dailydotdev/shared/src/components/fields/MarkdownInput';
import { AwardFeesNote } from '@dailydotdev/shared/src/components/cores/AwardFeesNote';
import { CoresBalanceNote } from '@dailydotdev/shared/src/components/cores/CoresBalanceNote';
import { maxNoteLength } from '@dailydotdev/shared/src/contexts/GiveAwardModalContext';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { award } from '@dailydotdev/shared/src/graphql/njord';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';
import { awardReceiver } from '../../flows/purchase/AwardFixed';
import { CoreAmount } from './kit';

// The award note of flows/purchase/AwardFixed.tsx in the redesign's line.
// Picking the award and the sent screen stay as production has them.

export type AwardReceiver = Pick<typeof awardReceiver, 'name' | 'image'>;

export const AwardNoteRedesign = ({
  product,
  coresAdded,
  receiver = awardReceiver,
  onBack,
  onSent,
  onRequestClose,
}: {
  product: Product;
  coresAdded?: number;
  receiver?: AwardReceiver;
  onBack: () => void;
  onSent: () => void;
  onRequestClose: () => void;
}): ReactElement => {
  const { updateUser, user } = useAuthContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const [note, setNote] = useState('');
  const { mutate: awardMutation, isPending } = useMutation({
    mutationFn: award,
    onSuccess: async () => {
      if (user) {
        await updateUser({
          ...user,
          balance: { amount: user.balance.amount - product.value },
        });
      }
      onSent();
    },
  });

  return (
    <Modal
      isOpen
      onRequestClose={onRequestClose}
      kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
    >
      <Modal.Header title="Give an Award" showCloseButton={!isMobile}>
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={onBack}
          size={ButtonSize.Small}
          className="mr-2 flex -rotate-90"
          icon={<ArrowIcon />}
        />
      </Modal.Header>
      <Modal.Body className="gap-4">
        {!!coresAdded && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            className="flex items-center gap-2 rounded-12 bg-action-cores-float px-3 py-2"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-action-cores-default text-surface-invert">
              <VIcon size={IconSize.Size16} />
            </span>
            {formatCoresCurrency(coresAdded)} Cores added. Your {product.name}{' '}
            is ready to send.
          </Typography>
        )}
        <div className="flex flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary px-4 py-5">
          <Image
            src={product.flags?.imageGlow || product.image}
            alt={product.name}
            className="size-24 object-contain"
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            bold
            className="flex items-center gap-1"
          >
            {product.name} · <CoreAmount value={product.value} />
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
            className="text-center"
          >
            Awesome choice! We&apos;re sure that{' '}
            <Typography
              bold
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              tag={TypographyTag.Span}
              className="inline-flex items-center gap-1 align-bottom"
            >
              <Image
                src={receiver.image}
                alt=""
                className="size-5 rounded-6 object-cover"
              />
              {receiver.name}
            </Typography>{' '}
            will appreciate this award!
          </Typography>
        </div>
        <form action="#" className="flex flex-1 flex-col">
          <MarkdownInput
            allowPreview={false}
            textareaProps={{
              name: 'content',
              rows: 5,
              placeholder:
                'Share a few words about why this Award is well deserved (optional)',
              maxLength: maxNoteLength,
            }}
            className={{ container: 'flex-1' }}
            initialContent=""
            enabledCommand={{ upload: false, link: false, mention: false }}
            showMarkdownGuide={false}
            onValueUpdate={(value) => setNote(value)}
          />
        </form>
      </Modal.Body>
      <Modal.Footer className="!h-auto flex-col !gap-2 !py-4">
        <Button
          loading={isPending}
          className="w-full"
          variant={ButtonVariant.Primary}
          onClick={() =>
            awardMutation({
              productId: product.id,
              type: 'POST',
              entityId: 'sb-post',
              note,
            })
          }
        >
          Send Award for <CoreIcon /> {formatCoresCurrency(product.value)}
        </Button>
        <CoresBalanceNote price={product.value} />
        <AwardFeesNote />
      </Modal.Footer>
    </Modal>
  );
};

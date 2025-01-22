import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import CloseButton from '../CloseButton';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { Button } from '../buttons/Button';
import { PlusTitle } from './PlusTitle';
import { Image } from '../image/Image';
import { usePaymentContext } from '../../contexts/PaymentContext';
import { plusUrl } from '../../lib/constants';
import { TextField } from '../fields/TextField';
import { UserIcon } from '../icons';
import { gqlClient } from '../../graphql/common';
import { RECOMMEND_MENTIONS_QUERY } from '../../graphql/comments';
import { RecommendedMention } from '../RecommendedMention';
import { BaseTooltip } from '../tooltips/BaseTooltip';
import type { UserShortProfile } from '../../lib/user';
import useDebounceFn from '../../hooks/useDebounceFn';

interface SelectedUserProps {
  user: UserShortProfile;
  onClose: () => void;
}

const SelectedUser = ({ user, onClose }: SelectedUserProps) => {
  const { image, username, name } = user;

  return (
    <div className="flex flex-row bg-surface-float">
      <Image src={image} alt={username} />
      <Typography bold type={TypographyType.Callout}>
        {name}
      </Typography>
      <Typography bold type={TypographyType.Callout}>
        {username}
      </Typography>
      <CloseButton
        type="button"
        className="ml-auto"
        onClick={onClose}
        size={ButtonSize.XSmall}
      />
    </div>
  );
};

export function GiftPlusModal(props: ModalProps): ReactElement {
  const { onRequestClose } = props;
  const { oneTimePayment } = usePaymentContext();
  const [selected, setSelected] = useState<UserShortProfile>();
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [onSearch] = useDebounceFn(setQuery, 500);
  const { data: users } = useQuery<UserShortProfile[]>({
    queryKey: ['search', 'users', query],
    queryFn: async () => {
      const result = await gqlClient.request(RECOMMEND_MENTIONS_QUERY, {
        query,
      });

      return result.recommendedMentions;
    },
    enabled: !!query?.length,
  });
  const isVisible = !!users?.length && !!query?.length;
  const onKeyDown = (e: React.KeyboardEvent) => {
    const movement = ['ArrowUp', 'ArrowDown'];
    if (!movement.includes(e.key)) {
      return;
    }

    e.preventDefault();

    if (e.key === 'ArrowDown') {
      setIndex((prev) => (prev + 1) % users.length);
    } else if (e.key === 'ArrowUp') {
      setIndex((prev) => (prev - 1 + users.length) % users.length);
    }
  };

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Body className="gap-4">
        <div className="flex flex-row justify-between">
          <PlusTitle type={TypographyType.Callout} bold />
          <CloseButton
            type="button"
            size={ButtonSize.Small}
            onClick={onRequestClose}
          />
        </div>
        <Typography bold type={TypographyType.Title1}>
          Gift daily.dev Plus 🎁
        </Typography>
        {selected ? (
          <SelectedUser user={selected} onClose={() => setSelected(null)} />
        ) : (
          <div className="flex flex-col">
            <BaseTooltip
              onClickOutside={() => setQuery('')}
              visible={isVisible}
              content={
                <RecommendedMention
                  users={users}
                  selected={index}
                  onClick={(user) => setSelected(user)}
                />
              }
              container={{
                className: 'shadow',
                paddingClassName: 'p-0',
                roundedClassName: 'rounded-16',
                bgClassName: 'bg-accent-pepper-subtlest',
              }}
            >
              <TextField
                leftIcon={<UserIcon />}
                inputId="search_user"
                fieldType="tertiary"
                autoComplete="off"
                label="Select a recipient by name or handle"
                onKeyDown={onKeyDown}
                onChange={(e) => onSearch(e.currentTarget.value.trim())}
                onFocus={(e) => onSearch(e.currentTarget.value.trim())}
              />
            </BaseTooltip>
          </div>
        )}
        <div className="flex w-full flex-row items-center gap-2 rounded-10 bg-surface-float p-2">
          <Typography bold type={TypographyType.Callout}>
            One-year plan
          </Typography>
          <Typography
            bold
            className="rounded-10 bg-action-upvote-float px-2 py-1"
            type={TypographyType.Caption1}
            color={TypographyColor.StatusSuccess}
          >
            2 months free
          </Typography>
          <Typography type={TypographyType.Body}>
            <strong className="mr-1">{oneTimePayment?.price}</strong>
            {oneTimePayment?.currencyCode}
          </Typography>
        </div>
        <Typography type={TypographyType.Callout}>
          Gift one year of daily.dev Plus for {oneTimePayment?.price}. Once the
          payment is processed, they’ll be notified of your gift. This is a
          one-time purchase, not a recurring subscription.
        </Typography>
        <Button
          tag="a"
          variant={ButtonVariant.Primary}
          href={`${plusUrl}?giftToUserId=${selected?.id}`}
          disabled={!selected}
        >
          Gift & Pay {oneTimePayment?.price}
        </Button>
      </Modal.Body>
    </Modal>
  );
}

export default GiftPlusModal;

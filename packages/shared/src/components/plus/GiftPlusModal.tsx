import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
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
import { PaymentContextProvider } from '../../contexts/payment';
import { usePaymentContext } from '../../contexts/payment/context';
import { TextField } from '../fields/TextField';
import { UserIcon } from '../icons';
import { gqlClient } from '../../graphql/common';
import { RECOMMEND_MENTIONS_QUERY } from '../../graphql/comments';
import { RecommendedMention } from '../RecommendedMention';
import { BaseTooltip } from '../tooltips/BaseTooltip';
import type { UserShortProfile } from '../../lib/user';
import useDebounceFn from '../../hooks/useDebounceFn';
import { PlusLabelColor, PlusPlanExtraLabel } from './PlusPlanExtraLabel';
import { ArrowKey, KeyboardCommand } from '../../lib/element';
import { GiftingSelectedUser } from './GiftingSelectedUser';
import Link from '../utilities/Link';
import { useViewSize, ViewSize } from '../../hooks';
import { Image } from '../image/Image';
import { fallbackImages } from '../../lib/config';
import { sizeClasses } from '../ProfilePicture';
import { ConditionalRender } from '../ConditionalWrapper';
import { Separator } from '../cards/common/common';
import { IconSize } from '../Icon';
import { ReputationUserBadge } from '../ReputationUserBadge';
import classed from '../../lib/classed';
import JoinedDate from '../profile/JoinedDate';
import { plusUrl } from '../../lib/constants';

interface GiftPlusModalProps extends ModalProps {
  preselected?: UserShortProfile;
  onSelected?: (user: UserShortProfile) => void;
}

const UserText = classed('span', 'flex flex-row items-center justify-center');

export function GiftPlusModalComponent({
  preselected,
  onSelected,
  ...props
}: GiftPlusModalProps): ReactElement {
  const [overlay, setOverlay] = useState<HTMLElement>();
  const { onRequestClose } = props;
  const { giftOneYear } = usePaymentContext();
  const [selected, setSelected] = useState(preselected);
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [onSearch] = useDebounceFn(setQuery, 500);
  const { data: users } = useQuery<UserShortProfile[]>({
    queryKey: ['search', 'users', query],
    queryFn: async () => {
      const result = await gqlClient.request(RECOMMEND_MENTIONS_QUERY, {
        query,
      });

      setIndex(0);

      return result.recommendedMentions;
    },
    enabled: !!query?.length,
  });
  const isVisible = !!users?.length && !!query?.length;
  const onKeyDown = (e: React.KeyboardEvent) => {
    const movement = [ArrowKey.Up, ArrowKey.Down, KeyboardCommand.Enter];
    if (!movement.includes(e.key as (typeof movement)[number])) {
      return;
    }

    if (!users?.length) {
      return;
    }

    e.preventDefault();

    if (e.key === ArrowKey.Down) {
      setIndex((prev) => {
        let next = prev + 1;
        let counter = 0;
        while (users[next % users.length]?.isPlus) {
          next += 1;
          counter += 1;

          if (counter > users.length) {
            return -1;
          }
        }
        return next % users.length;
      });
    } else if (e.key === ArrowKey.Up) {
      setIndex((prev) => {
        let next = prev - 1;
        let counter = 0;
        while (users[(next + users.length) % users.length]?.isPlus) {
          next -= 1;
          counter += 1;

          if (counter > users.length) {
            return -1;
          }
        }
        return (next + users.length) % users.length;
      });
    } else {
      setSelected(users[index]);
    }
  };

  const onSelect = (user: UserShortProfile) => {
    setSelected(user);
    setIndex(0);
    setQuery('');
  };

  const isTablet = useViewSize(ViewSize.Tablet);

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      overlayRef={setOverlay}
      isDrawerOnMobile
    >
      <Modal.Body className="gap-4 tablet:!p-4">
        <div className="flex flex-row justify-between">
          <PlusTitle type={TypographyType.Callout} bold />
          <CloseButton
            type="button"
            size={ButtonSize.Small}
            onClick={onRequestClose}
          />
        </div>
        <Typography bold type={TypographyType.Title1} className="text-center">
          Gift daily.dev Plus 🎁
        </Typography>
        <div className="flex flex-col items-center gap-2">
          <Image
            src={selected?.image ?? fallbackImages.avatar}
            className={classNames(sizeClasses.xxxxlarge, 'rounded-26')}
          />
          {preselected && (
            <>
              <UserText>
                <Typography bold type={TypographyType.Title3}>
                  {preselected.name}
                </Typography>
                <ReputationUserBadge
                  className="ml-0.5 !typo-footnote"
                  user={{ reputation: preselected.reputation }}
                  iconProps={{ size: IconSize.XSmall }}
                  disableTooltip
                />
              </UserText>
              <UserText>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Secondary}
                >
                  @{preselected.username}
                </Typography>
                <Separator />
                <JoinedDate
                  className="text-text-quaternary typo-caption2"
                  date={new Date(preselected.createdAt)}
                />
              </UserText>
            </>
          )}
        </div>
        <ConditionalRender condition={!preselected}>
          {selected ? (
            <GiftingSelectedUser
              user={selected}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="flex flex-col">
              <BaseTooltip
                appendTo={isTablet ? overlay : globalThis?.document?.body}
                onClickOutside={() => setQuery('')}
                visible={isVisible}
                showArrow={false}
                interactive
                content={
                  <RecommendedMention
                    className="w-[24rem]"
                    users={users}
                    selected={index}
                    onClick={onSelect}
                    checkIsDisabled={(user) => user.isPlus}
                    disabledTooltip="This user already has daily.dev Plus"
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
                  onFocus={(e) => setQuery(e.currentTarget.value.trim())}
                />
              </BaseTooltip>
            </div>
          )}
        </ConditionalRender>
        <div className="flex w-full flex-row items-center gap-2 rounded-10 bg-surface-float p-2 py-3">
          <Typography bold type={TypographyType.Callout}>
            One-year plan
          </Typography>
          {giftOneYear?.extraLabel && (
            <PlusPlanExtraLabel
              color={PlusLabelColor.Success}
              label={giftOneYear?.extraLabel}
              typographyProps={{ color: TypographyColor.StatusSuccess }}
            />
          )}
          <Typography type={TypographyType.Body} className="ml-auto mr-1">
            <strong className="mr-1">{giftOneYear?.price?.formatted}</strong>
            {giftOneYear?.currencyCode}
          </Typography>
        </div>
        <Typography type={TypographyType.Callout}>
          Gift one year of daily.dev Plus for {giftOneYear?.price?.formatted}.
          Once the payment is processed, they’ll be notified of your gift. This
          is a one-time purchase, not a recurring subscription.
        </Typography>
        <Link href={`${plusUrl}?gift=${selected?.id}`} passHref>
          <Button
            tag="a"
            disabled={!selected}
            variant={ButtonVariant.Primary}
            onClick={() => onSelected?.(selected)}
          >
            Gift & Pay {giftOneYear?.price.formatted}
          </Button>
        </Link>
      </Modal.Body>
    </Modal>
  );
}

export function GiftPlusModal(props: GiftPlusModalProps): ReactElement {
  return (
    <PaymentContextProvider>
      <GiftPlusModalComponent {...props} />
    </PaymentContextProvider>
  );
}

export default GiftPlusModal;

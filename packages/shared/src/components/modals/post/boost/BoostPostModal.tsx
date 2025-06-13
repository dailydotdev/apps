import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../common/Modal';
import type { ModalProps } from '../../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { CoreIcon, PlusIcon } from '../../../icons';
import type { Post } from '../../../../graphql/posts';
import { Image } from '../../../image/Image';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { largeNumberFormat } from '../../../../lib';
import { IconSize } from '../../../Icon';
import { AdsDashboardModal } from './AdsDashboardModal';
import { Origin } from '../../../../lib/log';
import { BuyCoresModal } from '../../award/BuyCoresModal';
import { usePostImage } from '../../../../hooks/post/usePostImage';
import type { TransactionCreated } from '../../../../graphql/njord';
import { isNullOrUndefined } from '../../../../lib/func';
import { BoostPostSuccessModal } from './BoostPostSuccessModal';

const Slider = dynamic(
  () => import('../../../fields/Slider').then((mod) => mod.Slider),
  { ssr: false },
);

interface BoostPostModalProps extends ModalProps {
  post: Post;
}

const SCREENS = {
  FORM: 'FORM',
  BUY_CORES: 'BUY_CORES',
  DASHBOARD: 'DASHBOARD',
  SUCCESS: 'SUCCESS',
} as const;

export type Screens = keyof typeof SCREENS;

export function BoostPostModal({
  post,
  ...props
}: BoostPostModalProps): ReactElement {
  const { user, updateUser } = useAuthContext();
  const [activeScreen, setActiveScreen] = useState<Screens>(SCREENS.FORM);
  const [coresPerDay, setCoresPerDay] = React.useState(5000);
  const [totalDays, setTotalDays] = React.useState(7);
  const [queryProps, setQueryProps] = React.useState({
    coresPerDay,
    totalDays,
  });
  const { data } = useQuery<{ min: number; max: number }>({
    queryKey: generateQueryKey(
      RequestKey.PostBoostReach,
      user,
      post.id,
      queryProps.coresPerDay,
      queryProps.totalDays,
    ),
  });
  const client = useQueryClient();
  const [debounceSet] = useDebounceFn(setQueryProps, 220);
  const totalSpendInt = coresPerDay * totalDays;
  const totalSpend = largeNumberFormat(totalSpendInt);
  const { mutateAsync: onBoost } = useMutation<{
    startPostBoost: TransactionCreated;
  }>({
    onSuccess: (result) => {
      setActiveScreen(SCREENS.SUCCESS);
      const balance = result?.startPostBoost?.balance;

      if (!isNullOrUndefined(balance)) {
        updateUser({ ...user, balance });
      }

      // invalidate wallet queries
      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });
    },
  });
  const image = usePostImage(post);

  const onButtonClick = () => {
    if (user.balance.amount < totalSpendInt) {
      return setActiveScreen(SCREENS.BUY_CORES);
    }

    return onBoost();
  };

  if (activeScreen === SCREENS.BUY_CORES) {
    return (
      <BuyCoresModal
        isOpen
        product={null}
        onCompletion={() => setActiveScreen(SCREENS.FORM)}
        onRequestClose={() => setActiveScreen(SCREENS.FORM)}
        origin={Origin.BoostPost}
      />
    );
  }

  if (activeScreen === SCREENS.SUCCESS) {
    return (
      <BoostPostSuccessModal
        {...props}
        onBackToDashboard={() => setActiveScreen(SCREENS.DASHBOARD)}
      />
    );
  }

  if (activeScreen === SCREENS.DASHBOARD) {
    return <AdsDashboardModal isOpen />;
  }

  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header className="items-center">
        <Typography type={TypographyType.Title3} bold>
          Boost your post
        </Typography>
        <Button
          className="ml-4"
          icon={<CoreIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
        >
          {user.balance.amount}
          <span className="ml-2 border-l border-border-subtlest-tertiary pl-2">
            <PlusIcon />
          </span>
        </Button>
      </Modal.Header>
      <Modal.Body className="flex flex-col !gap-6">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Give your content the spotlight it deserves. Our auto-targeting engine
          ensures your post gets shown to the developers most likely to care.
        </Typography>
        <div className="rounded-16 bg-surface-float">
          <div className="flex flex-row items-center gap-5 p-2">
            <Typography
              type={TypographyType.Callout}
              className="ml-2 line-clamp-2 flex-1"
            >
              {post.title ?? post.sharedPost?.title}
            </Typography>
            {image && <Image className="h-12 w-18 rounded-12" src={image} />}
          </div>
          <div className="flex flex-col items-center rounded-16 bg-surface-float p-3">
            <Typography type={TypographyType.Title3} bold>
              {totalSpend} Cores over {totalDays} days
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Total spend
            </Typography>
            <Typography className="mt-2" type={TypographyType.Body}>
              {data?.min ?? 0} - {data?.max ?? 0}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Estimated reach
            </Typography>
          </div>
        </div>
        <div className="flex flex-col">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Budget
          </Typography>
          <span className="flex items-center gap-2">
            <CoreIcon />
            <Typography
              type={TypographyType.Body}
              className="flex items-center"
              bold
            >
              {largeNumberFormat(coresPerDay || 0)} Cores per day
            </Typography>
          </span>
          <Slider
            className="mt-2 w-full"
            min={1000}
            max={100000}
            step={1000}
            defaultValue={[coresPerDay]}
            onValueChange={([value]) => {
              setCoresPerDay(value);
              debounceSet({
                coresPerDay: value,
                totalDays,
              });
            }}
          />
          <Typography
            className="mt-4"
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Duration
          </Typography>
          <Typography type={TypographyType.Body} bold>
            {totalDays} days
          </Typography>
          <Slider
            className="mt-2 w-full"
            min={1}
            max={30}
            step={1}
            defaultValue={[totalDays]}
            onValueChange={([value]) => {
              setTotalDays(value);
              debounceSet({
                coresPerDay,
                totalDays: value,
              });
            }}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          type="button"
          onClick={onButtonClick}
        >
          Boost post for <CoreIcon size={IconSize.Small} /> {totalSpend}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BoostPostModal;

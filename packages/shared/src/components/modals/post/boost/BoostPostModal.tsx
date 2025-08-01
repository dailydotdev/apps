import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
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
import { largeNumberFormat } from '../../../../lib';
import { IconSize } from '../../../Icon';
import { Origin } from '../../../../lib/log';
import { BuyCoresModal } from '../../award/BuyCoresModal';
import { usePostImage } from '../../../../hooks/post/usePostImage';
import { usePostBoostMutation } from '../../../../hooks/post/usePostBoostMutations';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../common/types';
import { ActionSuccessModal } from '../../utils/ActionSuccessModal';
import { postBoostSuccessCover } from '../../../../lib/image';
import { boostPostDocsLink, walletUrl } from '../../../../lib/constants';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { Loader } from '../../../Loader';
import {
  DEFAULT_CORES_PER_DAY,
  DEFAULT_DURATION_DAYS,
} from '../../../../graphql/post/boost';
import { usePostBoostEstimation } from '../../../../hooks/post/usePostBoostEstimation';

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
  SUCCESS: 'SUCCESS',
} as const;

export type Screens = keyof typeof SCREENS;

export function BoostPostModal({
  post,
  ...props
}: BoostPostModalProps): ReactElement {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();
  const [activeScreen, setActiveScreen] = useState<Screens>(SCREENS.FORM);
  const [coresPerDay, setCoresPerDay] = React.useState(DEFAULT_CORES_PER_DAY);
  const [totalDays, setTotalDays] = React.useState(DEFAULT_DURATION_DAYS);
  const [estimate, setEstimate] = useState({ coresPerDay, totalDays });
  const [updateEstimate] = useDebounceFn(setEstimate, 400);
  const totalSpendInt = coresPerDay * totalDays;
  const totalSpend = largeNumberFormat(totalSpendInt);
  const { estimatedReach, canBoost, isLoading } = usePostBoostEstimation({
    post,
    query: { budget: estimate.coresPerDay, duration: estimate.totalDays },
  });
  const { onBoostPost } = usePostBoostMutation({
    onBoostSuccess: () => setActiveScreen(SCREENS.SUCCESS),
  });
  const image = usePostImage(post);

  const onButtonClick = () => {
    if (user.balance.amount < totalSpendInt) {
      return setActiveScreen(SCREENS.BUY_CORES);
    }

    return onBoostPost({
      duration: totalDays,
      budget: coresPerDay,
      id: post.id,
    });
  };

  if (activeScreen === SCREENS.BUY_CORES) {
    return (
      <BuyCoresModal
        isOpen
        product={null}
        onCompletion={() => setActiveScreen(SCREENS.FORM)}
        onRequestClose={() => setActiveScreen(SCREENS.FORM)}
        amountNeededCopy={
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            You need{' '}
            <strong>
              {Math.abs(user.balance.amount - totalSpendInt).toLocaleString()}{' '}
              more Cores
            </strong>{' '}
            to boost the post.
          </Typography>
        }
        origin={Origin.BoostPost}
      />
    );
  }

  if (activeScreen === SCREENS.SUCCESS) {
    return (
      <ActionSuccessModal
        {...props}
        cta={{
          copy: 'Ads dashboard',
          onClick: () => openModal({ type: LazyModal.AdsDashboard }),
        }}
        secondaryCta={{
          copy: 'Learn more about boosting',
          tag: 'a',
          href: boostPostDocsLink,
          target: '_blank',
        }}
        content={{
          title: 'Post boosted successfully!',
          description:
            'Your post is now being promoted and will start reaching more developers shortly. You can track its performance anytime from the ads dashboard.',
          cover: postBoostSuccessCover,
        }}
      />
    );
  }

  // just to avoid any edge case where the min, for some reason is greater than max
  const maxReach = Math.max(estimatedReach.min, estimatedReach.max);

  const potentialReach = (() => {
    if (isLoading || !canBoost) {
      return <Loader data-testid="loader" />;
    }

    const min = largeNumberFormat(estimatedReach.min);
    const max = largeNumberFormat(maxReach);

    return `${min} - ${max}`;
  })();

  return (
    <Modal
      {...props}
      isOpen
      shouldCloseOnOverlayClick={false}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
    >
      <Modal.Header className="items-center">
        <Typography type={TypographyType.Title3} bold>
          Boost your post
        </Typography>
        <div className="ml-4 flex flex-row rounded-10 bg-surface-float">
          <Button
            icon={<CoreIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            target="_blank"
            href={walletUrl}
            tag="a"
          >
            {largeNumberFormat(user.balance.amount)}
          </Button>
          <div className="my-1 border-l border-border-subtlest-tertiary" />
          <Button
            icon={<PlusIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={() => setActiveScreen('BUY_CORES')}
          />
        </div>
      </Modal.Header>
      <Modal.Body className="flex flex-col !gap-6">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Give your content the spotlight it deserves. Our auto-targeting engine
          ensures your post gets shown to the developers most likely to care.
          <a
            href={boostPostDocsLink}
            className="text-text-link"
            target="_blank"
          >
            Learn more
          </a>
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
            <Typography
              className="mt-2 min-h-[1.375rem]"
              type={TypographyType.Body}
            >
              {potentialReach}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Estimated daily reach
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
              updateEstimate((state) => ({ ...state, coresPerDay: value }));
              setCoresPerDay(value);
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
            onValueChange={([value]) => setTotalDays(value)}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={ButtonVariant.Primary}
          className="w-full"
          type="button"
          onClick={onButtonClick}
          disabled={!canBoost || isLoading}
        >
          Boost post for <CoreIcon size={IconSize.Small} /> {totalSpend}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BoostPostModal;

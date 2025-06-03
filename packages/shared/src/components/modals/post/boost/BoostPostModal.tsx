import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Slider } from '../../../fields/Slider';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { largeNumberFormat } from '../../../../lib';
import { IconSize } from '../../../Icon';

interface BoostPostModalProps extends ModalProps {
  post: Post;
}

export function BoostPostModal({
  post,
  ...props
}: BoostPostModalProps): ReactElement {
  const { user } = useAuthContext();
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
  const [debounceSet] = useDebounceFn(setQueryProps, 220);
  const totalSpend = largeNumberFormat(coresPerDay * totalDays);

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
              {post.title}
            </Typography>
            {post.image && (
              <Image className="h-12 w-18 rounded-12" src={post.image} />
            )}
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
        <Button variant={ButtonVariant.Primary} className="w-full">
          Boost post for <CoreIcon size={IconSize.Small} /> {totalSpend}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default BoostPostModal;

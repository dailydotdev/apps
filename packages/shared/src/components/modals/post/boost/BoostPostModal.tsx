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
import { RequestKey } from '../../../../lib/query';

interface BoostPostModalProps extends ModalProps {
  post: Post;
}

export function BoostPostModal({
  post,
  ...props
}: BoostPostModalProps): ReactElement {
  const { user } = useAuthContext();
  const [coresPerDay] = React.useState(5000);
  const [totalDays] = React.useState(7);
  const { data } = useQuery<{ min: number; max: number }>({
    queryKey: [RequestKey.PostBoostReach, post.id, coresPerDay, totalDays],
  });

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
            <span className="line-clamp-2 flex-1">{post.title}</span>
            {post.image && (
              <Image className="h-12 w-18 rounded-12" src={post.image} />
            )}
          </div>
          <div className="flex flex-col items-center rounded-16 bg-surface-float p-3">
            <Typography type={TypographyType.Title3} bold>
              {coresPerDay * totalDays} Cores over {totalDays} days
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
      </Modal.Body>
    </Modal>
  );
}

export default BoostPostModal;

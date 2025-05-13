import type { ReactElement } from 'react';
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { checkFetchMore } from '../../containers/InfiniteScrolling';
import UserListModal from '../UserListModal';

import { FlexCentered } from '../../utilities';
import { Origin } from '../../../lib/log';
import { listAwardsInfiniteQueryOptions } from '../../../graphql/njord';
import type { PropsParameters } from '../../../types';
import { ArrowIcon, CoreIcon } from '../../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { formatCoresCurrency } from '../../../lib/utils';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';

export interface ListAwardsModalProps extends ModalProps {
  onBack?: ModalProps['onAfterClose'];
  queryProps: PropsParameters<typeof listAwardsInfiniteQueryOptions>;
}

export const ListAwardsModal = ({
  queryProps,
  children,
  className,
  onBack,
  ...props
}: ListAwardsModalProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const queryResult = useInfiniteQuery(
    listAwardsInfiniteQueryOptions(queryProps),
  );
  const { data, isFetchingNextPage, fetchNextPage, isPending } = queryResult;

  const title = 'Awards given';
  const coresTotal = data?.pages[0]?.awardsTotal?.amount ?? 0;

  return (
    <UserListModal
      {...props}
      className={classNames('pb-2', className)}
      title={title}
      header={
        typeof onBack === 'function' ? (
          <Modal.Header title={title} showCloseButton={!isMobile}>
            <Button
              variant={ButtonVariant.Tertiary}
              onClick={onBack}
              size={ButtonSize.Small}
              className="mr-2 flex -rotate-90"
              icon={<ArrowIcon />}
            />
          </Modal.Header>
        ) : null
      }
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
      users={data?.pages.reduce((acc, p) => {
        p?.awards?.edges.forEach(({ node }) => {
          acc.push({
            ...node.user,
            award: node.award,
          });
        });

        return acc;
      }, [])}
      userListProps={{
        emptyPlaceholder: isPending ? null : (
          <FlexCentered className="p-10 text-text-tertiary typo-callout">
            No awards found
          </FlexCentered>
        ),
      }}
      origin={Origin.AwardsList}
      showFollow={false}
      showAward
    >
      <div className="flex flex-col px-6">
        <div className="flex items-center gap-2 py-4">
          <CoreIcon className="!size-14" />
          <div className="flex flex-col">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              Cores given
            </Typography>
            <Typography bold type={TypographyType.Title2}>
              {formatCoresCurrency(coresTotal)}
            </Typography>
          </div>
        </div>
        <hr className="border-border-subtlest-tertiary pb-2" />
      </div>
    </UserListModal>
  );
};

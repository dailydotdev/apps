import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Modal } from '../../common/Modal';
import type { ModalProps } from '../../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { CoreIcon, InfoIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import { SimpleTooltip } from '../../../tooltips';
import { BoostIcon } from '../../../icons/Boost';

interface TileProps {
  label: string;
  value: number;
  info?: string;
  icon?: ReactNode;
}

const Tile: React.FC<TileProps> = ({ label, value, info }) => {
  return (
    <div className="flex flex-col gap-1 rounded-14 border border-border-subtlest-tertiary p-4">
      <span className="flex flex-row items-center gap-1">
        <Typography type={TypographyType.Footnote}>{label}</Typography>
        <SimpleTooltip content={info}>
          <InfoIcon size={IconSize.Size16} />
        </SimpleTooltip>
      </span>
      <span className="flex flex-row items-center gap-1">
        <Typography type={TypographyType.Title2} bold>
          {value}
        </Typography>
      </span>
    </div>
  );
};

export function AdsDashboardModal(props: ModalProps): ReactElement {
  return (
    <Modal
      {...props}
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      isDrawerOnMobile
    >
      <Modal.Header>
        <Typography type={TypographyType.Title3} bold>
          Ads dashboard
        </Typography>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <Modal.Subtitle>Overview all time</Modal.Subtitle>
        <div className="grid grid-cols-2 gap-4">
          <Tile
            label="Ads cost"
            value={0}
            icon={<CoreIcon size={IconSize.XSmall} />}
          />
          <Tile label="Ads views" value={0} />
          <Tile label="Comments" value={0} />
          <Tile label="Upvotes" value={0} />
        </div>
        <Modal.Subtitle>Running ads</Modal.Subtitle>
        <div className="flex flex-col items-center gap-4">
          <BoostIcon className="text-text-disabled" size={IconSize.XXLarge} />
          <Typography type={TypographyType.Title2} bold>
            Ads dashboard
          </Typography>
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Callout}
            className="text-center"
          >
            Once you boost a post, you’ll see real-time insights here—like
            views, clicks, and engagement metrics.
          </Typography>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AdsDashboardModal;

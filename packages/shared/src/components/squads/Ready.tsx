import React, { ReactElement, useContext } from 'react';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import { TextField } from '../fields/TextField';
import LinkIcon from '../icons/Link';
import { Squad } from '../../graphql/squads';
import SquadReadySvg from '../../svg/SquadReady';
import CopyIcon from '../icons/Copy';
import Alert, { AlertType } from '../widgets/Alert';
import { useCopyLink } from '../../hooks/useCopyLink';
import {
  ModalState,
  SquadStateProps,
  SquadTitle,
  SquadTitleColor,
} from './utils';
import { ModalPropsContext } from '../modals/common/types';

export function SquadReady({
  squad,
}: SquadStateProps & { squad?: Squad }): ReactElement {
  const { activeView } = useContext(ModalPropsContext);
  if (ModalState.Ready !== activeView) return null;
  if (!squad) return <Modal.Body>loading...</Modal.Body>;
  const {
    name,
    handle,
    permalink,
    members: {
      edges: [owner],
    },
  } = squad;
  const invitation = `${permalink}/${owner.node.referralToken}`;
  const [copying, copyLink] = useCopyLink(() => invitation);

  const onCopy = () => {
    copyLink();
  };

  return (
    <>
      <Modal.Body className="flex flex-col items-center">
        <SquadTitle>
          Invite your Squad <SquadTitleColor>members</SquadTitleColor>
        </SquadTitle>
        <SquadReadySvg className="mt-6 mb-4" />
        <h3 className="font-bold typo-title2">{name}</h3>
        <h4>{handle}</h4>
        <TextField
          className={{ container: 'w-full mt-6' }}
          name="permalink"
          inputId="permalink"
          label={permalink}
          type="url"
          fieldType="tertiary"
          disabled
          actionButton={
            <Button
              icon={<CopyIcon />}
              onClick={onCopy}
              disabled={copying}
              className="btn-tertiary"
              data-testid="textfield-action-icon"
            />
          }
          value={permalink}
          readOnly
        />
        <Alert
          className="mt-4"
          type={AlertType.Info}
          title="Your Squad's dedicated space will open up once a new member joins. We will notify you when it happens."
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          icon={<LinkIcon />}
          className="flex-1 mx-4 btn-primary-cabbage"
          onClick={onCopy}
          disabled={copying}
        >
          Copy invitation link
        </Button>
      </Modal.Footer>
    </>
  );
}

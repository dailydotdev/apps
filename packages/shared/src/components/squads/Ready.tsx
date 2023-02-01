import React, { ReactElement, useContext, useRef } from 'react';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import LinkIcon from '../icons/Link';
import { Squad } from '../../graphql/squads';
import SquadReadySvg from '../../svg/SquadReady';
import Alert, { AlertType } from '../widgets/Alert';
import {
  ModalState,
  SquadStateProps,
  SquadTitle,
  SquadTitleColor,
} from './utils';
import { ModalPropsContext } from '../modals/common/types';
import { InviteTextField, InviteTextFieldHandle } from './InviteTextField';

export function SquadReady({
  squad,
}: SquadStateProps & { squad?: Squad }): ReactElement {
  const { activeView } = useContext(ModalPropsContext);
  if (ModalState.Ready !== activeView) return null;
  if (!squad) return <Modal.Body>loading...</Modal.Body>;
  const { name, handle } = squad;
  const inviteTextRef = useRef<InviteTextFieldHandle>();

  return (
    <>
      <Modal.Body className="flex flex-col items-center">
        <SquadTitle>
          Invite your Squad <SquadTitleColor>members</SquadTitleColor>
        </SquadTitle>
        <SquadReadySvg className="mt-6 mb-4" />
        <h3 className="font-bold typo-title2">{name}</h3>
        <h4>@{handle}</h4>
        <InviteTextField squad={squad} ref={inviteTextRef} />
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
          onClick={() => inviteTextRef.current?.copyLink()}
        >
          Copy invitation link
        </Button>
      </Modal.Footer>
    </>
  );
}

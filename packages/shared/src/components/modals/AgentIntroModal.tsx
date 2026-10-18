import type { MouseEvent, ReactElement, ReactNode } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';

interface IntroPointProps {
  title: string;
  children: ReactNode;
}

const IntroPoint = ({ title, children }: IntroPointProps): ReactElement => (
  <li className="flex flex-col gap-1">
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </li>
);

export const AgentIntroModal = ({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement => {
  const { completeAction } = useActions();

  const handleClose = (event: MouseEvent) => {
    completeAction(ActionType.InterestAgentIntroSeen);
    onRequestClose?.(event);
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={handleClose}
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={handleClose} />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-3">
          <Typography type={TypographyType.Title2} bold>
            Meet Agent
          </Typography>
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            Finding content you care about still means doing the work yourself:
            following tags, tuning filters, checking back. Agent does it for
            you.
          </Typography>
        </div>
        <ul className="flex flex-col gap-4">
          <IntroPoint title="Just say what you're into">
            &quot;cool zig projects&quot;, &quot;how teams deploy agents in
            prod&quot;, &quot;cool new Next.js features&quot;. No tags or
            keyword rules. A short onboarding sets frequency, how picky it is,
            and notifications.
          </IntroPoint>
          <IntroPoint title="It works in the background">
            It searches daily.dev and the web and only pings you when something
            actually matters. You can also choose when to run it, if that is
            what you prefer. Keeping notifications on is recommended!
          </IntroPoint>
          <IntroPoint title="Agent makes a Wrong call? Tell it!">
            Is it &quot;less tutorials&quot;, &quot;more from the compiler
            side&quot; or something else... Plain-text feedback beats any
            setting and agent learns and keeps memory for each feedback you give
            it.
          </IntroPoint>
        </ul>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          This feature is still in BETA so looking forward to your feedback
          which will be crucial for its future.
          <br />
          <br /> Cheers, daily.dev team ❤️
        </Typography>
      </div>
    </Modal>
  );
};

export default AgentIntroModal;

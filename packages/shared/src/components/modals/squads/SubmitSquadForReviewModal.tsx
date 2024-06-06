import React, { ReactElement, useState } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { Button, ButtonVariant } from '../../buttons/Button';
import { useSquad } from '../../../hooks';
import { EditIcon, EarthIcon, ImageIcon, MegaphoneIcon } from '../../icons';
import { Checkbox } from '../../fields/Checkbox';
import { IconSize } from '../../Icon';
import classed from '../../../lib/classed';
import { SimpleTooltip } from '../../tooltips';
import { Anchor } from '../../text';
import { usePublicSquadRequests } from '../../../hooks/squads';
import { contentGuidelines } from '../../../lib/constants';

interface ChecklistItemProps {
  iconTag: React.ElementType;
  children?: React.ReactNode;
}

const ChecklistItem = ({
  iconTag: IconTag,
  children,
}: ChecklistItemProps): ReactElement => {
  return (
    <li className="flex items-center gap-2">
      <IconTag
        className="text-accent-cabbage-default"
        size={IconSize.Small}
        secondary
      />
      <span className="flex-1">{children}</span>
    </li>
  );
};

const Checklist = classed(
  'ul',
  'flex flex-col gap-5 p-5 my-3 rounded-16 bg-surface-float typo-callout',
);

const Header = classed('div', 'flex flex-col items-center gap-4');

const SubHeader = classed(
  'p',
  'mt-5 typo-body text-text-secondary text-center',
);

interface Props extends ModalProps {
  squadId: string;
}

const SubmitSquadForReviewModal = ({
  onRequestClose,
  squadId,
  ...props
}: Props): ReactElement => {
  const { squad, isFetched } = useSquad({ handle: squadId });
  const [meets, setMeets] = useState(false);

  const { submitForReview, isSubmitLoading } = usePublicSquadRequests({
    sourceId: squad?.id,
    onSuccessfulSubmission: () => {
      onRequestClose(null);
    },
  });

  if (!isFetched || !squad) {
    return null;
  }

  return (
    <Modal
      {...props}
      isOpen
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden"
    >
      <Modal.Body>
        <Header>
          <EarthIcon size={IconSize.XLarge} className="text-text-primary" />
          <h3 className="font-bold typo-large-title">Submit for review</h3>
        </Header>
        <SubHeader>
          Follow the checklist below to increase the chances of passing the
          review successfully
        </SubHeader>
        <Checklist>
          <ChecklistItem iconTag={MegaphoneIcon}>
            The posts I shared meet the{' '}
            <Anchor href={contentGuidelines} target="_blank" rel="noopener">
              content guidelines
            </Anchor>
          </ChecklistItem>
          <ChecklistItem iconTag={ImageIcon}>
            I uploaded a Squad image that matches the purpose of my Squad
          </ChecklistItem>
          <ChecklistItem iconTag={EditIcon}>
            I added a description that clarifies the purpose of the Squad
          </ChecklistItem>
        </Checklist>
        <Checkbox
          className="ml-4"
          name="meets_requirements"
          checked={meets}
          onToggle={setMeets}
        >
          {squad.name} meets all the requirements above
        </Checkbox>
      </Modal.Body>
      <Modal.Footer className="flex h-auto justify-between py-2 pl-6 pr-2">
        <Button variant={ButtonVariant.Tertiary} onClick={onRequestClose}>
          Close
        </Button>
        <SimpleTooltip
          content={
            !meets &&
            'Ensure the Squad meets the requirements and click the check box to submit'
          }
        >
          <div>
            <Button
              variant={ButtonVariant.Primary}
              disabled={!meets}
              onClick={submitForReview}
              loading={isSubmitLoading}
            >
              Submit for review
            </Button>
          </div>
        </SimpleTooltip>
      </Modal.Footer>
    </Modal>
  );
};

export default SubmitSquadForReviewModal;

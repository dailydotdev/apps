import React, { FormEvent, ReactElement, useState } from 'react';
import request from 'graphql-request';
import classNames from 'classnames';
import { Modal } from './common/Modal';
import ArrowIcon from '../icons/Arrow';
import { Button } from '../buttons/Button';
import classed from '../../lib/classed';
import { TextField } from '../fields/TextField';
import UserIcon from '../icons/User';
import AtIcon from '../icons/At';
import LinkIcon from '../icons/Link';
import Textarea from '../fields/Textarea';
import { Squad } from '../../graphql/squads';
import PostItemCard from '../post/PostItemCard';
import SquadReadySvg from '../../svg/SquadReady';
import { formToJson } from '../../lib/form';
import CopyIcon from '../icons/Copy';
import Alert, { AlertType } from '../widgets/Alert';
import ImageInput from '../fields/ImageInput';
import { cloudinary } from '../../lib/image';
import CameraIcon from '../icons/Camera';
import { SourceData, SOURCE_QUERY } from '../../graphql/sources';
import { apiUrl } from '../../lib/config';
import { useCopyLink } from '../../hooks/useCopyLink';

type NewSquadModalProps = {
  onRequestClose: () => void;
  onPreviousState: () => void;
};

enum ModalState {
  Details = 'Squad details',
  SelectArticle = 'Share article',
  WriteComment = 'Write comment',
  Ready = 'Squad ready',
}

const modalStateOrder = [
  ModalState.Details,
  ModalState.SelectArticle,
  ModalState.WriteComment,
  ModalState.Ready,
];

const Title = classed('h3', 'text-center typo-large-title font-bold');
const TitleColor = classed('span', 'text-theme-color-cabbage');

type SquadForm = Pick<Squad, 'name' | 'handle' | 'description'>;
type StateProps = {
  modalState: ModalState;
  onNext: (squad?: SquadForm) => void;
  form: Partial<SquadForm>;
  setForm: React.Dispatch<React.SetStateAction<Partial<SquadForm>>>;
};

async function checkSourceExists(id: string): Promise<boolean> {
  try {
    const data = await request<SourceData>(`${apiUrl}/graphql`, SOURCE_QUERY, {
      id,
    });
    return !!data.source;
  } catch (err) {
    return false;
  }
}

function SquadDetails({
  modalState,
  onNext,
  form,
  setForm,
}: StateProps): ReactElement {
  if (ModalState.Details !== modalState) return null;
  const { name, handle, description } = form;
  const [handleValid, setHandleValid] = useState(true);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formJson = formToJson<SquadForm>(e.currentTarget);
    if (!formJson.name || !formJson.handle) {
      return;
    }
    const handleExists = await checkSourceExists(formJson.handle);
    setHandleValid(!handleExists);
    if (!handleExists) {
      onNext(formJson);
    }
  };
  return (
    <>
      <Modal.Body>
        <form
          className="flex flex-col gap-4 items-center"
          onSubmit={onSubmit}
          id="squad-form"
        >
          <Title>
            Make it look <TitleColor>yours.</TitleColor>
          </Title>
          <ImageInput
            fallbackImage={cloudinary.squads.imageFallback}
            className={{
              container: 'rounded-full border-0 my-1',
              img: 'object-cover',
            }}
            hoverIcon={<CameraIcon size="xlarge" />}
          />
          <TextField
            label="Squad name"
            inputId="name"
            name="name"
            valid={!!name}
            leftIcon={<UserIcon />}
            value={name ?? ''}
            className={{
              container: 'w-full',
            }}
            valueChanged={(text) => setForm({ ...form, name: text })}
          />
          <TextField
            label="Handle"
            inputId="handle"
            hint={!handleValid ? 'The handle is already exists' : undefined}
            valid={handleValid}
            name="handle"
            leftIcon={<AtIcon />}
            value={handle ?? ''}
            className={{
              hint: 'text-theme-status-error',
              container: classNames('w-full', handleValid && 'mb-5'),
            }}
            valueChanged={(text) => setForm({ ...form, handle: text })}
          />
          <Textarea
            label="Squad description"
            inputId="description"
            name="description"
            hint="(optional)"
            rows={4}
            value={description ?? ''}
            maxLength={250}
            className={{
              hint: '-mt-8 py-2 pl-4',
              container: 'w-full',
            }}
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn-primary-cabbage"
          form="squad-form"
          type="submit"
          disabled={!name || !handle}
        >
          Continue
        </Button>
      </Modal.Footer>
    </>
  );
}

function SquadSelectArticle({ modalState, onNext }: StateProps): ReactElement {
  if (ModalState.SelectArticle !== modalState) return null;
  return (
    <Modal.Body>
      <Title>
        Select one <TitleColor>article.</TitleColor>
      </Title>
      <p className="py-4 text-center">
        Make your squad aware of your reading history by sharing one article
        with them
      </p>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div onClick={() => onNext()}>
        <PostItemCard
          className="-mx-6"
          postItem={{
            post: { image: '', title: 'title', commentsPermalink: '', id: '' },
          }}
          showButtons={false}
        />
      </div>
    </Modal.Body>
  );
}

function SquadComment({ modalState, onNext }: StateProps): ReactElement {
  if (ModalState.WriteComment !== modalState) return null;
  return (
    <>
      <Modal.Body>
        <Textarea
          label="Share your thought and insights about the article…"
          inputId="comment"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-primary-cabbage" onClick={() => onNext()}>
          Finish
        </Button>
      </Modal.Footer>
    </>
  );
}

function SquadReady({
  modalState,
  name,
  handle,
  permalink,
}: StateProps & Squad): ReactElement {
  if (ModalState.Ready !== modalState) return null;
  const [copying, copyLink] = useCopyLink(() => permalink);

  const onCopy = () => {
    copyLink();
  };
  return (
    <>
      <Modal.Body className="flex flex-col gap-2 items-center">
        <Title>
          Invite your <TitleColor>members.</TitleColor>
        </Title>
        <SquadReadySvg className="mt-8 mb-4" />
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
          title="You will be able to access the squad's space once a new member joins."
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

function NewSquadModal({
  onPreviousState,
  onRequestClose,
}: NewSquadModalProps): ReactElement {
  const [modalState, setModalState] = useState(ModalState.Details);
  const [squad, setSquad] = useState<Squad>();
  const changeState = (prev: boolean) => {
    const index = modalStateOrder.findIndex((state) => state === modalState);
    const changeTo = modalStateOrder[index + (prev ? -1 : 1)];
    if (changeTo) setModalState(changeTo);
    else if (prev) onPreviousState();
    else onRequestClose();
  };
  const stepperWidth = () => {
    const index =
      modalStateOrder.findIndex((state) => state === modalState) + 1;
    return (index / modalStateOrder.length) * 100;
  };
  const onNext = (squadForm?: SquadForm) => {
    changeState(false);
    if (squadForm)
      setSquad({
        ...squadForm,
        active: true,
        image: null,
        permalink: 'http://webapp.local.com:5002/squads/dailydotdev',
        public: true,
        type: 'squad',
      });
  };
  const [form, setForm] = useState<Partial<SquadForm>>({});
  const stateProps: StateProps = {
    modalState,
    form,
    setForm,
    onNext,
  };
  return (
    <Modal
      isOpen
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
    >
      {modalState === ModalState.Ready && <Modal.Header title={modalState} />}
      {modalState !== ModalState.Ready && (
        <Modal.Header>
          <Button
            icon={<ArrowIcon className="-rotate-90" />}
            className="flex justify-center items-center mr-2 -ml-2 btn btn-tertiary iconOnly"
            onClick={() => changeState(true)}
          />
          <h3 className="font-bold typo-callout">{modalState}</h3>
        </Modal.Header>
      )}
      <div
        className="absolute left-0 h-1 top-[3.3rem] bg-theme-color-cabbage transition-[width]"
        style={{ width: `${stepperWidth()}%` }}
      />
      <SquadDetails {...stateProps} />
      <SquadSelectArticle {...stateProps} />
      <SquadComment {...stateProps} />
      <SquadReady {...stateProps} {...squad} />
    </Modal>
  );
}

export default NewSquadModal;

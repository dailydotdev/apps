import type { ReactElement } from 'react';
import React from 'react';

import classNames from 'classnames';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ArrowIcon, CoinIcon } from '../../icons';
import { Image } from '../../image/Image';
import { cloudinaryAwardUnicorn } from '../../../lib/image';
import {
  GiveAwardModalContextProvider,
  useGiveAwardModalContext,
} from '../../../contexts/GiveAwardModalContext';
import { Justify } from '../../utilities';
import MarkdownInput from '../../fields/MarkdownInput';
import { termsOfService } from '../../../lib/constants';
import { Origin } from '../../../lib/log';
import { CopyType } from '../../sources/SourceActions/SourceActionsFollow';
import UserList from '../../profile/UserList';
import { useViewSize, ViewSize } from '../../../hooks';
import { ModalKind } from '../common/types';
import type { UserShortProfile } from '../../../lib/user';

const AwardItem = () => {
  const { setActiveStep } = useGiveAwardModalContext();
  return (
    <Button
      variant={ButtonVariant.Float}
      className="flex !h-auto flex-col items-center justify-center gap-2 rounded-14 bg-surface-float p-2"
      onClick={() => setActiveStep('COMMENT')}
    >
      <Image
        src={cloudinaryAwardUnicorn}
        alt="Award unicorn"
        className="size-[3.25rem]"
      />
      <div className="flex items-center justify-center rounded-10 bg-action-bookmark-float p-1">
        <Typography
          bold
          type={TypographyType.Subhead}
          color={TypographyColor.Credit}
          tag={TypographyTag.Span}
        >
          Free
        </Typography>
      </div>
    </Button>
  );
};

const IntroScreen = () => {
  const { setActiveStep, onRequestClose } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  return (
    <>
      <Modal.Header
        title={isMobile ? null : 'Give an Award'}
        showCloseButton={!isMobile}
      >
        {isMobile ? (
          <Button
            onClick={onRequestClose}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="mr-2"
          >
            Close
          </Button>
        ) : null}
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 flex flex-col items-center justify-center gap-2 p-4">
          <Image
            src={cloudinaryAwardUnicorn}
            alt="Award unicorn"
            className="size-[7.5rem]"
          />
          <Typography
            type={TypographyType.Title3}
            bold
            color={TypographyColor.Primary}
          >
            15 Awards given
          </Typography>
          <Button
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Float}
            onClick={() => setActiveStep('SHOW_ALL')}
          >
            See all →
          </Button>
        </div>
        <Typography type={TypographyType.Callout} className="text-center">
          Show your appreciation! Pick an Award to send to{' '}
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Credit}
            tag={TypographyTag.Span}
          >
            John doe
          </Typography>
          !
        </Typography>
        <div className="mt-4 grid grid-cols-3 gap-2 tablet:grid-cols-4">
          {new Array(30).fill(null).map((item, i) => (
            /* eslint-disable react/no-array-index-key */
            <AwardItem key={i} />
          ))}
        </div>
      </Modal.Body>
    </>
  );
};

const CommentScreen = () => {
  const { setActiveStep } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <>
      <Modal.Header title="Give an Award" showCloseButton={!isMobile}>
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={() => setActiveStep('INTRO')}
          size={ButtonSize.Small}
          className="mr-2 flex -rotate-90"
          icon={<ArrowIcon />}
        />
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4 flex flex-col items-center justify-center">
          <Image
            src={cloudinaryAwardUnicorn}
            alt="Award unicorn"
            className="size-[7.5rem]"
          />
          <Typography type={TypographyType.Callout} className="text-center">
            Awesome choice! We’re sure that{' '}
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Credit}
              tag={TypographyTag.Span}
            >
              John doe
            </Typography>{' '}
            will appreciate this award!
          </Typography>
        </div>
        <form action="#" className="flex flex-1 flex-col">
          <MarkdownInput
            allowPreview={false}
            textareaProps={{
              name: 'content',
              rows: 6,
              placeholder:
                'Share a few words about why this Award is well deserved (optional)',
            }}
            className={{
              container: 'flex-1',
            }}
            initialContent=""
            enabledCommand={{ upload: false, link: false, mention: true }}
            showMarkdownGuide={false}
          />
        </form>
      </Modal.Body>
      <Modal.Footer className="!h-auto flex-col" justify={Justify.Center}>
        <Button className="w-full" variant={ButtonVariant.Primary}>
          Send Award for <CoinIcon /> 50
        </Button>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="text-center"
        >
          Awards may include a revenue share with the recipient and are subject
          to our{' '}
          <a
            href={termsOfService}
            target="_blank"
            rel="noopener"
            className="font-bold underline"
          >
            Terms of Service
          </a>
          .
        </Typography>
      </Modal.Footer>
    </>
  );
};

const ShowAllScreen = () => {
  const { setActiveStep } = useGiveAwardModalContext();
  const isMobile = useViewSize(ViewSize.MobileL);
  const users: UserShortProfile[] = [
    {
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      image: 'https://randomuser.me/api',
      permalink: 'https://randomuser.me/api',
      bio: 'Lorem Ipsum',
      createdAt: '2020-01-01',
      reputation: 100,
      companies: [],
      isPlus: true,
      plusMemberSince: new Date('2020-01-01'),
    },
    {
      id: '2',
      name: 'Jane Doe',
      username: 'janedoe',
      image: 'https://randomuser.me/api',
      permalink: 'https://randomuser.me/api',
      bio: 'Lorem Ipsum',
      createdAt: '2020-01-01',
      reputation: 100,
      companies: [],
      isPlus: false,
      plusMemberSince: new Date('2020-01-01'),
    },
  ];
  return (
    <>
      <Modal.Header title="Awards received" showCloseButton={!isMobile}>
        <Button
          variant={ButtonVariant.Tertiary}
          onClick={() => setActiveStep('INTRO')}
          size={ButtonSize.Small}
          className="mr-2 flex -rotate-90"
          icon={<ArrowIcon />}
        />
      </Modal.Header>
      <Modal.Body className="!p-0">
        <div
          className={classNames(
            'flex items-center justify-center gap-2 p-8',
            isMobile ? 'flex-row' : 'flex-col',
          )}
        >
          <Image
            src={cloudinaryAwardUnicorn}
            alt="Award unicorn"
            className="size-14"
          />
          {isMobile ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
              >
                Awards given
              </Typography>
              <Typography
                type={TypographyType.Title2}
                bold
                color={TypographyColor.Primary}
              >
                175
              </Typography>
            </div>
          ) : (
            <>
              <Typography
                type={TypographyType.Body}
                bold
                color={TypographyColor.Primary}
              >
                175
              </Typography>
              <Typography
                type={TypographyType.Title3}
                bold
                color={TypographyColor.Primary}
              >
                Awards given by the community
              </Typography>
            </>
          )}
        </div>
        <UserList
          scrollingProps={{
            isFetchingNextPage: false,
            canFetchMore: false,
            fetchNextPage: () => null,
          }}
          users={users}
          additionalContent={() => (
            <div className="flex items-center justify-center gap-2">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Credit}
                bold
                className="flex"
              >
                <CoinIcon /> 45
              </Typography>
              <div className="flex size-7 items-center justify-center rounded-10 bg-surface-float">
                <Image
                  src={cloudinaryAwardUnicorn}
                  alt="Award unicorn"
                  className="size-5"
                />
              </div>
            </div>
          )}
          userInfoProps={{
            origin: Origin.BlockedFilter,
            showFollow: false,
            showSubscribe: false,
            copyType: CopyType.Custom,
          }}
        />
      </Modal.Body>
    </>
  );
};

const ModalBody = () => {
  const { activeStep } = useGiveAwardModalContext();
  return (
    <>
      {activeStep === 'INTRO' ? <IntroScreen /> : null}
      {activeStep === 'COMMENT' ? <CommentScreen /> : null}
      {activeStep === 'SHOW_ALL' ? <ShowAllScreen /> : null}
    </>
  );
};

const GiveAwardModal = ({ ...props }: ModalProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <GiveAwardModalContextProvider onRequestClose={props.onRequestClose}>
      <Modal
        kind={isMobile ? ModalKind.FlexibleTop : Modal.Kind.FlexibleCenter}
        size={Modal.Size.Small}
        className={classNames(!isMobile ? '!h-[40rem]' : undefined)}
        {...props}
      >
        <ModalBody />
      </Modal>
    </GiveAwardModalContextProvider>
  );
};

export default GiveAwardModal;

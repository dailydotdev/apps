import React, {
  Dispatch,
  FormEvent,
  FormEventHandler,
  KeyboardEvent,
  ReactElement,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import { ProfilePicture } from '../ProfilePicture';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import AuthContext from '../../contexts/AuthContext';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TextField } from '../fields/TextField';
import LinkIcon from '../icons/Link';
import { Post } from '../../graphql/posts';
import useDebounce from '../../hooks/useDebounce';
import { isValidHttpUrl } from '../../lib/links';
import { KeyboardCommand } from '../../lib/element';
import PostPreview from '../post/PostPreview';
import { Loader } from '../Loader';
import { usePostToSquad } from '../../hooks/squads/usePostToSquad';
import { Switch } from '../fields/Switch';
import { SquadStateProps } from './utils';

export type SubmitSharePostFunc = (
  e: React.FormEvent<HTMLFormElement>,
  commentary?: string,
) => Promise<Post | void>;

export interface SquadCommentProps
  extends Pick<SquadStateProps, 'form' | 'onUpdateForm'> {
  onSubmit: SubmitSharePostFunc;
  isLoading?: boolean;
  notificationState: [boolean, Dispatch<SetStateAction<boolean>>];
  shouldShowToggle: boolean;
}

enum LinkError {
  Required = 'Please enter URL!',
  Invalid = 'URL is invalid!',
}

export function SquadComment({
  onSubmit,
  form,
  shouldShowToggle,
  isLoading,
  onUpdateForm,
  notificationState,
}: SquadCommentProps): ReactElement {
  const textinput = useRef<HTMLTextAreaElement>();
  const { preview, handle, file, name } = form;
  const postExists = !!preview.id;
  const [enableNotification, setEnableNotification] = notificationState;
  const { user } = useContext(AuthContext);
  const [commentary, setCommentary] = useState(form.commentary);
  const [link, setLink] = useState(preview.url);
  const [linkHint, setLinkHint] = useState(preview.url);
  const { getLinkPreview, isLoadingPreview } = usePostToSquad({
    callback: {
      onSuccess: (linkPreview, url) => {
        onUpdateForm((state) => ({
          ...state,
          preview: { url, ...linkPreview },
        }));
        textinput?.current?.focus();
      },
      onError: (_, url) =>
        onUpdateForm((state) => ({ ...state, preview: { url } })),
    },
  });

  const [checkUrl] = useDebounce((url: string) => {
    if (!isValidHttpUrl(url) || url === preview.url) return null;

    return getLinkPreview(url);
  }, 1000);

  const onInputChange: FormEventHandler<HTMLInputElement> = (e) => {
    const text = e.currentTarget.value;
    setLink(text);
    checkUrl(text);
    if (!text) return setLinkHint(LinkError.Required);

    if (isValidHttpUrl(text)) {
      if (linkHint) setLinkHint('');
      return null;
    }

    if (!linkHint || linkHint === LinkError.Required)
      return setLinkHint(LinkError.Invalid);

    return null;
  };

  useEffect(() => {
    if (preview.title) {
      textinput?.current?.focus?.();
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitForm = (e?: FormEvent<HTMLFormElement>) =>
    onSubmit(e, commentary);

  const handleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const pressedSpecialkey = e.ctrlKey || e.metaKey;

    if (
      pressedSpecialkey &&
      e.key === KeyboardCommand.Enter &&
      commentary?.length
    ) {
      onSubmitForm(null);
    }
  };

  return (
    <>
      <Modal.Body
        className={classNames('flex flex-col', !postExists && 'pb-2')}
      >
        <form
          onSubmit={(e) => onSubmitForm(e)}
          className="flex flex-col flex-1"
          id="squad-comment"
        >
          <span className="flex flex-row flex-1 gap-4">
            <ProfilePicture user={user} />
            <textarea
              placeholder="Share your thought and insights about the post…"
              className="flex-1 self-stretch w-full min-w-0 focus:placeholder-transparent bg-transparent focus:outline-none resize-none typo-body caret-theme-label-link text-theme-label-primary"
              value={commentary}
              onKeyDown={handleKeydown}
              onChange={(event) => setCommentary(event.target.value)}
              ref={textinput}
            />
          </span>
          <PostPreview
            className="mb-4"
            preview={preview}
            isLoading={isLoadingPreview}
          />
          {!postExists && (
            <TextField
              leftIcon={isLoadingPreview ? <Loader /> : <LinkIcon />}
              label="Enter link to share"
              fieldType="tertiary"
              inputId="url"
              name="url"
              type="url"
              autoComplete="off"
              required
              value={link}
              onInput={onInputChange}
              hint={linkHint}
              saveHintSpace
              disabled={isLoading}
            />
          )}
        </form>
      </Modal.Body>
      <Modal.Footer
        className={classNames(
          'flex flex-col justify-center',
          shouldShowToggle && 'h-[unset]',
        )}
      >
        {shouldShowToggle && (
          <Switch
            data-testId="push_notification-switch"
            inputId="push_notification-switch"
            name="push_notification"
            labelClassName="flex-1 font-normal"
            className="py-3 w-full max-w-full"
            compact={false}
            checked={enableNotification}
            onToggle={() => setEnableNotification(!enableNotification)}
          >
            Receive updates whenever your Squad members engage with your post
          </Switch>
        )}
        <span className="flex justify-between w-full">
          <div className="flex">
            <Image
              className="object-cover mr-3 w-8 h-8 rounded-full"
              src={file ?? cloudinary.squads.imageFallback}
            />
            <div>
              <h5 className="font-bold typo-caption1">{name}</h5>
              <h6 className="typo-caption1 text-theme-label-tertiary">
                @{handle}
              </h6>
            </div>
          </div>
          <SimpleTooltip
            placement="left"
            disabled={!!commentary}
            content="Please add a comment before proceeding"
          >
            <div>
              <Button
                form="squad-comment"
                className="btn-primary-cabbage"
                type="submit"
                loading={isLoading}
                disabled={
                  !commentary || isLoading || isLoadingPreview || !preview.title
                }
              >
                Done
              </Button>
            </div>
          </SimpleTooltip>
        </span>
      </Modal.Footer>
    </>
  );
}

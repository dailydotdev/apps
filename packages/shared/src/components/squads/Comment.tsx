import React, {
  FormEvent,
  FormEventHandler,
  KeyboardEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import classNames from 'classnames';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import { ProfilePicture } from '../ProfilePicture';
import { Justify } from '../utilities';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import AuthContext from '../../contexts/AuthContext';
import { SquadForm } from '../../graphql/squads';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { isNullOrUndefined } from '../../lib/func';
import { TextField } from '../fields/TextField';
import LinkIcon from '../icons/Link';
import {
  ExternalLink,
  getExternalLinkPreview,
  getPostByUrl,
  Post,
} from '../../graphql/posts';
import { ApiError, ApiErrorResult, hasApiError } from '../../graphql/common';
import useDebounce from '../../hooks/useDebounce';
import { isValidHttpUrl } from '../../lib/links';
import { KeyboardCommand } from '../../lib/element';
import PostPreview from '../post/PostPreview';
import { Loader } from '../Loader';
import { useToastNotification } from '../../hooks/useToastNotification';

export type SubmitSharePostFunc = (
  e: React.FormEvent<HTMLFormElement>,
  commentary?: string,
) => Promise<Post | void>;

interface SquadCommentProps {
  onSubmit: SubmitSharePostFunc;
  form: Partial<SquadForm>;
  isLoading?: boolean;
  onUpdateForm?: (form: Partial<SquadForm>) => void;
}

enum LinkError {
  Required = 'Please enter URL!',
  Invalid = 'URL is invalid!',
}

export function SquadComment({
  onSubmit,
  form,
  isLoading,
  onUpdateForm,
}: SquadCommentProps): ReactElement {
  const { displayToast } = useToastNotification();
  const textinput = useRef<HTMLTextAreaElement>();
  const { privateLink, post: postItem } = form;
  const { post } = postItem;
  const { user } = useContext(AuthContext);
  const [commentary, setCommentary] = useState(form.commentary);
  const [link, setLink] = useState(privateLink?.url);
  const [linkHint, setLinkHint] = useState(privateLink?.url);
  const { mutateAsync: getPrivateLink, isLoading: isLinkLoading } = useMutation(
    getExternalLinkPreview,
    {
      onSuccess: (preview, url) => {
        onUpdateForm({ privateLink: { url, ...preview } });
      },
      onError: (err: ApiErrorResult, url) => {
        const rateLimited = hasApiError(err, ApiError.RateLimited);
        if (rateLimited) {
          displayToast(rateLimited.message);
        }
        onUpdateForm({ privateLink: { url } });
      },
    },
  );
  const { mutateAsync: getPost, isLoading: isCheckingUrl } = useMutation(
    (param: string) => {
      if (!param || !isValidHttpUrl(param) || param === form.privateLink?.url) {
        return null;
      }

      return getPostByUrl(param);
    },
    {
      onSuccess: (postByUrl) => {
        if (postByUrl) {
          onUpdateForm({ post: { post: postByUrl } });
          textinput?.current?.focus();
        }
      },
      onError: (err: ApiErrorResult, url) => {
        if (
          hasApiError(err, ApiError.NotFound) &&
          !isNullOrUndefined(postItem)
        ) {
          onUpdateForm({ post: { post: null } });
          getPrivateLink(url);
        }
      },
    },
  );
  const [checkUrl] = useDebounce(getPost, 1000);

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
    if (post) {
      textinput?.current?.focus?.();
    }
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

  const preview: ExternalLink = (() => {
    if (post) {
      return { url: post.permalink, title: post.title, image: post.image };
    }

    if (privateLink?.title && privateLink?.image) {
      return privateLink;
    }

    return null;
  })();

  const isPreviewLoading = isLinkLoading || isCheckingUrl;

  return (
    <>
      <Modal.Body
        className={classNames('flex flex-col', privateLink && !post && 'pb-2')}
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
            isLoading={isPreviewLoading}
          />
          {privateLink && !post && (
            <TextField
              leftIcon={isPreviewLoading ? <Loader /> : <LinkIcon />}
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
      <Modal.Footer justify={Justify.Between}>
        <div className="flex">
          <Image
            className="object-cover mr-3 w-8 h-8 rounded-full"
            src={form.file ?? cloudinary.squads.imageFallback}
          />
          <div>
            <h5 className="font-bold typo-caption1">{form.name}</h5>
            <h6 className="typo-caption1 text-theme-label-tertiary">
              @{form.handle}
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
              disabled={!commentary || isLoading || isPreviewLoading}
            >
              Done
            </Button>
          </div>
        </SimpleTooltip>
      </Modal.Footer>
    </>
  );
}

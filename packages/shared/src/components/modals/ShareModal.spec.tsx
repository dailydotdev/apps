import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { IFlags } from 'flagsmith';
import { useRouter } from 'next/router';
import ShareModal from './ShareModal';
import Post from '../../../__tests__/fixture/post';
import { getFacebookShareLink } from '../../lib/share';
import { Origin } from '../../lib/analytics';
import Comment from '../../../__tests__/fixture/comment';
import { getCommentHash } from '../../graphql/comments';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { FeaturesContextProvider } from '../../contexts/FeaturesContext';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { ADD_POST_TO_SQUAD_MUTATION } from '../../graphql/squads';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import { LazyModalElement } from './LazyModalElement';
import { ActionType, COMPLETE_ACTION_MUTATION } from '../../graphql/actions';

const defaultPost = Post;
const defaultComment = Comment;
const onRequestClose = jest.fn();
let features: IFlags;

const defaultFeatures: IFlags = {
  squad: {
    enabled: true,
  },
};

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

beforeEach(async () => {
  nock.cleanAll();
  jest.clearAllMocks();
  features = defaultFeatures;
});

const squads = [generateTestSquad()];

const renderComponent = (
  loggedIn = true,
  hasSquads = true,
  comment?,
): RenderResult => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <FeaturesContextProvider flags={features}>
        <AuthContextProvider
          user={loggedIn ? loggedUser : null}
          updateUser={jest.fn()}
          tokenRefreshed
          getRedirectUri={jest.fn()}
          loadingUser={false}
          loadedUserFromCache
          squads={hasSquads ? squads : []}
        >
          <LazyModalElement />
          <ShareModal
            origin={Origin.Feed}
            post={defaultPost}
            comment={comment}
            isOpen
            onRequestClose={onRequestClose}
            ariaHideApp={false}
          />
        </AuthContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

describe('ShareModal Test Suite:', () => {
  it('should render the article preview', async () => {
    renderComponent();
    expect(screen.getByAltText(`${defaultPost.title}`)).toBeInTheDocument();
    expect(
      screen.getByAltText(`Avatar of ${defaultPost.source.handle}`),
    ).toBeInTheDocument();
    expect(screen.getByText(defaultPost.title)).toBeInTheDocument();
  });

  it('should render the component without logged in user', async () => {
    features = {};
    renderComponent(false, false);
    expect(screen.getByText('Share post')).toBeInTheDocument();
  });

  it('should render the component with logged user but no squads and open new squad page', async () => {
    renderComponent(true, false);
    const btn = await screen.findByTestId('social-share-New Squad');

    expect(btn).toBeInTheDocument();
    btn.click();
    const useRouterMock = useRouter as jest.Mock;
    const routerPushMock =
      useRouterMock.mock.results[useRouterMock.mock.results.length - 1].value
        .push;

    await waitFor(() => {
      expect(routerPushMock).toHaveBeenCalled();
      expect(routerPushMock).toHaveBeenCalledWith('/squads/new?origin=share');
    });
  });

  it('should render the component with logged user and squads and open the share to squad modal', async () => {
    renderComponent(true, true);
    let queryCalled = false;
    mockGraphQL({
      request: {
        query: ADD_POST_TO_SQUAD_MUTATION,
        variables: {
          id: defaultPost.id,
          sourceId: squads[0].id,
          commentary: '',
        },
      },
      result: () => {
        queryCalled = true;
        return { data: { sharePost: { id: 123 } } };
      },
    });
    mockGraphQL({
      request: {
        query: COMPLETE_ACTION_MUTATION,
        variables: { type: ActionType.SquadFirstPost },
      },
      result: { data: { _: true } },
    });
    const btn = await screen.findByTestId(`social-share-@${squads[0].handle}`);

    expect(btn).toBeInTheDocument();
    btn.click();
    await waitForNock();
    await waitFor(() => expect(queryCalled).toBeTruthy());
  });

  it('should render the Facebook button and have the correct link', async () => {
    renderComponent();
    const link = await screen.findByTestId(`social-share-Facebook`);

    expect(link).toHaveAttribute(
      'href',
      getFacebookShareLink(defaultPost.commentsPermalink),
    );
  });

  it('should render the Facebook button and have the correct comments link', async () => {
    renderComponent(false, false, defaultComment);
    const link = await screen.findByTestId(`social-share-Facebook`);

    expect(link).toHaveAttribute(
      'href',
      getFacebookShareLink(
        `${defaultPost.commentsPermalink}${getCommentHash(defaultComment.id)}`,
      ),
    );
  });

  it('should render the copy link button and copy link to clipboard', async () => {
    renderComponent();
    const btn = await screen.findByTestId('social-share-Copy link');

    btn.click();
    await waitFor(() =>
      expect(window.navigator.clipboard.writeText).toBeCalledWith(
        defaultPost.commentsPermalink,
      ),
    );
  });

  it('should render the copy link button and copy comments link to clipboard', async () => {
    renderComponent(false, false, defaultComment);
    const btn = await screen.findByTestId('social-share-Copy link');

    btn.click();
    await waitFor(() =>
      expect(window.navigator.clipboard.writeText).toBeCalledWith(
        `${defaultPost.commentsPermalink}${getCommentHash(defaultComment.id)}`,
      ),
    );
  });
});

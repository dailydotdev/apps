/*
* TESTS
* - ~~should render with no value~~
* - ~~should render with beta tag~~
* - ~~should render with clear search~~
* - should render with search history empty
* - should render with search history populated
* - should render with submit
* - ~~should render with progress bar~~
* - ~~should render with progress bar complete~~
* - ~~should render without completion time~~
* - ~~should render with completion time~~
*/


import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import React from 'react';
import nock from 'nock';
import { IFlags } from 'flagsmith';
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
import { ActionType, COMPLETE_ACTION_MUTATION } from '../../graphql/actions';
import { SearchBar, SearchBarProps } from './SearchBar';

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
  props: Partial<SearchBarProps> = {},
): RenderResult => {
  const client = new QueryClient();
  const defaultProps: SearchBarProps = {
    inputId: 'name',
    name: 'name',
  };
  

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
          squads={squads}
        >
          <SearchBar {...defaultProps} {...props} />
        </AuthContextProvider>
      </FeaturesContextProvider>
    </QueryClientProvider>,
  );
};

describe('SearchBar', () => {
  it('should render with the beta flag', async () => {
    renderComponent();

    expect(screen.getByTestId('searchBar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask anything…')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('should render with no clear button when the value is empty', async () => {
    renderComponent();
    const clear = screen.queryByTitle('Clear query');

    await waitFor(() => expect(clear).not.toBeInTheDocument());
  });

  it('should render with clear button when there is a value and clear on click', async () => {
    renderComponent(true, { value: 'search' });
    const input = screen.queryByRole('textbox') as HTMLInputElement;
    const clear = screen.queryByTitle('Clear query');

    await waitFor(() => expect(clear).toBeInTheDocument());
    expect(input.value).toEqual('search');
    clear.click();
    expect(input.value).toEqual('');
  });

  it('should render with progress bar', async () => {
    renderComponent(true);
    const progress = screen.queryByTestId('SearchProgressBar');

    await waitFor(() => expect(progress).toBeInTheDocument());
  });

  it('should render without progress bar', async () => {
    renderComponent(true, { showProgress: false });
    const progress = screen.queryByTestId('SearchProgressBar');

    await waitFor(() => expect(progress).not.toBeInTheDocument());
  });

  // TODO: Fix this test
  it('should render with progress bar and completed time', async () => {
    renderComponent(true, { showProgress: true, completedTime: '12:00' }).debug();
    const progress = screen.queryByTestId('SearchProgressBar');
    await waitFor(() => expect(progress).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Done! 12:00 seconds.').toBeInTheDocument()));
  });

  // TODO: Fix this test
  it('should render with progress bar without completed time', async () => {
    renderComponent(true, { showProgress: true, completedTime: '12:00' }).debug();
    const progress = screen.queryByTestId('SearchProgressBar');
    await waitFor(() => expect(progress).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Done! 12:00 seconds.').not.toBeInTheDocument()));
  });

  it('should submit the search query when the submit button is clicked', () => {
  const onSubmit = jest.fn();
    renderComponent(true, { inputId: "search", value: "test", onSubmit: onSubmit});
    const submitButton = screen.getByTitle('Submit');
    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalled();
  });

});

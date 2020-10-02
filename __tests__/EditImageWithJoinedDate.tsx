import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { changeProfileImage, LoggedUser } from '../lib/user';
import EditImageWithJoinedDate from '../components/profile/EditImageWithJoinedDate';
import { mocked } from 'ts-jest/utils';

jest.mock('../lib/user', () => ({
  ...jest.requireActual('../lib/user'),
  changeProfileImage: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

const defaultUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '2020-07-26T13:04:35.000Z',
};

const renderComponent = (user: Partial<LoggedUser> = {}): RenderResult => {
  return render(<EditImageWithJoinedDate user={{ ...defaultUser, ...user }} />);
};

it('should show profile image', () => {
  renderComponent();
  const el = screen.getByAltText('Your profile image');
  expect(el).toHaveAttribute('src', defaultUser.image);
});

it('should show github provider information', () => {
  renderComponent();
  const el = screen.getByText('via GitHub');
  expect(el).toBeInTheDocument();
});

it('should show google provider information', () => {
  renderComponent({ providers: ['google'] });
  const el = screen.getByText('via Google');
  expect(el).toBeInTheDocument();
});

it('should upload the new image profile image', async () => {
  renderComponent();
  mocked(changeProfileImage).mockResolvedValue({
    ...defaultUser,
    image: 'https://daily.dev/new.png',
  });
  const input = screen.getByTestId('profileImage');
  const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
  const readAsDataURL = jest.fn();
  Object.defineProperty(global, 'FileReader', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      readAsDataURL,
    })),
  });
  Object.defineProperty(input, 'files', {
    value: [file],
  });
  fireEvent.change(input);
  await waitFor(() => expect(readAsDataURL).toBeCalledTimes(1));
  expect(changeProfileImage).toBeCalledWith(file);
  const el = screen.getByAltText('Your profile image');
  await waitFor(() =>
    expect(el).toHaveAttribute('src', 'https://daily.dev/new.png'),
  );
});

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToolLogo } from './ToolLogo';
import { apiUrl } from '../../lib/config';

it('should render the logo stored on the tool', () => {
  render(
    <ToolLogo
      title="Docker"
      faviconUrl="https://media.daily.dev/docker.png"
      url="https://www.docker.com"
    />,
  );

  expect(screen.getByAltText('Docker logo')).toHaveAttribute(
    'src',
    'https://media.daily.dev/docker.png',
  );
});

it('should resolve the real logo from the tool website when the dataset has none', () => {
  render(<ToolLogo title="Docker" faviconUrl={null} url="docker.com" />);

  expect(screen.getByAltText('Docker logo')).toHaveAttribute(
    'src',
    `${apiUrl}/icon?url=docker.com&size=96`,
  );
});

it('should request the given size, never below the service minimum', () => {
  render(<ToolLogo title="Docker" url="docker.com" size={160} />);

  expect(screen.getByAltText('Docker logo')).toHaveAttribute(
    'src',
    `${apiUrl}/icon?url=docker.com&size=160`,
  );
});

it('should render the initial when there is no logo and no website', () => {
  render(<ToolLogo title="docker" />);

  expect(screen.queryByAltText('docker logo')).not.toBeInTheDocument();
  expect(screen.getByText('D')).toBeInTheDocument();
});

it('should fall back to the initial when the logo fails to load', () => {
  render(<ToolLogo title="Docker" url="docker.com" />);

  fireEvent.error(screen.getByAltText('Docker logo'));

  expect(screen.queryByAltText('Docker logo')).not.toBeInTheDocument();
  expect(screen.getByText('D')).toBeInTheDocument();
});

it('should render the given fallback instead of the initial', () => {
  render(<ToolLogo title="Docker" fallback={<span>no logo</span>} />);

  expect(screen.getByText('no logo')).toBeInTheDocument();
});

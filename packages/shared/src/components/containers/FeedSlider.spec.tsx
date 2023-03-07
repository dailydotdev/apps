import React from 'react';
import { render, screen } from '@testing-library/react';
import FeedSlider from './FeedSlider';
import FeedContext, {
  defaultFeedContextData,
} from '../../contexts/FeedContext';
import SettingsContext from '../../contexts/SettingsContext';
import { createTestSettings } from '../../../__tests__/fixture/settings';

describe('ChangelogTooltip component', () => {
  const Item = ({ item }) => {
    return <div>Slide {item.id}</div>;
  };
  const defaultItems = [
    {
      id: 'test1',
    },
    {
      id: 'test2',
    },
    {
      id: 'test3',
    },
    {
      id: 'test4',
    },
    {
      id: 'test5',
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    global.ResizeObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  const renderComponent = () => {
    return render(
      <FeedContext.Provider
        value={{
          ...defaultFeedContextData,
          numCards: {
            eco: 3,
            roomy: 2,
            cozy: 2,
          },
        }}
      >
        <SettingsContext.Provider value={createTestSettings()}>
          <FeedSlider items={defaultItems} Item={Item} />
        </SettingsContext.Provider>
      </FeedContext.Provider>,
    );
  };

  it('should render', async () => {
    renderComponent();

    const slider = screen.getByTestId('feedSlider');

    expect(slider).toBeInTheDocument();
  });
});

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ModalSidebarList } from './ModalSidebar';
import { ModalPropsContext } from './types';
import { EditIcon } from '../../icons';

const renderList = (isMobile: boolean, setActiveView = jest.fn()) =>
  render(
    <ModalPropsContext.Provider
      value={
        {
          activeView: undefined,
          setActiveView,
          tabs: [
            { title: 'General', options: { icon: <EditIcon /> } },
            { title: 'Tags', options: { icon: <EditIcon /> } },
          ],
          isMobile,
        } as unknown as React.ContextType<typeof ModalPropsContext>
      }
    >
      <ModalSidebarList title="For You" defaultOpen />
    </ModalPropsContext.Provider>,
  );

describe('ModalSidebarList on a phone', () => {
  it('draws the sections as settings rows without a header of its own', () => {
    const setActiveView = jest.fn();
    renderList(true, setActiveView);

    expect(screen.queryByText('For You')).not.toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Tags'));
    expect(setActiveView).toHaveBeenCalledWith('Tags');
  });

  it('keeps the sidebar list with its title on wider screens', () => {
    renderList(false);

    expect(screen.getByText('For You')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });
});

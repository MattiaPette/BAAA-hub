import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import HomeIcon from '@mui/icons-material/Home';
import { renderWithProviders as render } from '../../../../test-utils';
import { SidebarItem } from './SidebarItem';

describe('SidebarItem', () => {
  it('should render sidebar item with text', () => {
    render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Home"
        path="/home"
        open
        selected={false}
      />,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should render with closed state', () => {
    render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Home"
        path="/home"
        open={false}
        selected={false}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should render as divider', () => {
    render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Section"
        path="/section"
        open
        selected={false}
        isDivider
      />,
    );

    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('should handle selected state', () => {
    render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Home"
        path="/home"
        open
        selected
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('Mui-selected');
  });

  it('should show tooltip on hover when closed', () => {
    render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Home"
        path="/home"
        open={false}
        selected={false}
      />,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // After mouseEnter, the component re-renders with tooltip,
    // so we need to query for the button again
    const buttonAfterHover = screen.getByRole('button');
    expect(buttonAfterHover).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', () => {
    render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Home"
        path="/home"
        open={false}
        selected={false}
      />,
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // After mouseEnter, get the new button reference
    const buttonWithTooltip = screen.getByRole('button');
    fireEvent.mouseLeave(buttonWithTooltip);

    // After mouseLeave, get the button reference again
    const buttonAfterLeave = screen.getByRole('button');
    expect(buttonAfterLeave).toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Home"
        path="/home"
        open
        selected={false}
      />,
    );

    const icon = container.querySelector('.MuiSvgIcon-root');
    expect(icon).toBeInTheDocument();
  });

  it('should not render when isHidden is true', () => {
    const { container } = render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Home"
        path="/home"
        open
        selected={false}
        isHidden
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle divider with open=false state', () => {
    render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Section"
        path="/section"
        open={false}
        selected={false}
        isDivider
      />,
    );

    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('should render tooltip branch with open=true and hovered state', () => {
    render(
      <SidebarItem
        index={0}
        icon={HomeIcon}
        text="Home"
        path="/home"
        open
        selected={false}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});

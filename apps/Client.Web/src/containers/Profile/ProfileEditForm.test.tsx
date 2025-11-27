import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SportType, User, PrivacyLevel } from '@baaa-hub/shared-types';
import { renderWithProviders as render } from '../../test-utils';
import { ProfileEditForm } from './ProfileEditForm';

const mockUser: User = {
  id: '1',
  authId: 'auth0|123',
  name: 'John',
  surname: 'Doe',
  nickname: 'johndoe',
  email: 'john.doe@example.com',
  dateOfBirth: '1990-05-15T00:00:00.000Z',
  sportTypes: [SportType.RUNNING, SportType.CYCLING],
  profilePicture: undefined,
  stravaLink: 'https://www.strava.com/athletes/12345',
  instagramLink: 'https://www.instagram.com/johndoe',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isBlocked: false,
  isEmailVerified: true,
  roles: [],
  privacySettings: {
    email: PrivacyLevel.PUBLIC,
    dateOfBirth: PrivacyLevel.PUBLIC,
    sportTypes: PrivacyLevel.PUBLIC,
    socialLinks: PrivacyLevel.PUBLIC,
  },
};

describe('ProfileEditForm', () => {
  const mockOnUpdate = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) =>
    render(
      <MemoryRouter>
        <ProfileEditForm
          user={mockUser}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          isSubmitting={false}
          {...props}
        />
      </MemoryRouter>,
    );

  it('should render form with user data pre-filled', () => {
    renderForm();

    expect(screen.getByLabelText('First Name')).toHaveValue('John');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
    expect(screen.getByLabelText('Strava Profile')).toHaveValue(
      'https://www.strava.com/athletes/12345',
    );
    expect(screen.getByLabelText('Instagram Profile')).toHaveValue(
      'https://www.instagram.com/johndoe',
    );
  });

  it('should render date of birth field', () => {
    renderForm();

    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
  });

  it('should render sport types selector', () => {
    renderForm();

    expect(screen.getByLabelText('Sport Types')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    renderForm();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onUpdate when form is submitted', async () => {
    renderForm();

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should disable buttons when isSubmitting is true', () => {
    renderForm({ isSubmitting: true });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  it('should show "Saving..." text when isSubmitting is true', () => {
    renderForm({ isSubmitting: true });

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
  });

  it('should validate required first name', async () => {
    renderForm();

    const firstNameInput = screen.getByLabelText('First Name');
    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.blur(firstNameInput);

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });
  });

  it('should validate required last name', async () => {
    renderForm();

    const lastNameInput = screen.getByLabelText('Last Name');
    fireEvent.change(lastNameInput, { target: { value: '' } });
    fireEvent.blur(lastNameInput);

    await waitFor(() => {
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
    });
  });

  it('should validate first name max length', async () => {
    renderForm();

    const firstNameInput = screen.getByLabelText('First Name');
    const longName = 'a'.repeat(51);
    fireEvent.change(firstNameInput, { target: { value: longName } });
    fireEvent.blur(firstNameInput);

    await waitFor(() => {
      expect(
        screen.getByText('First name must be 50 characters or less'),
      ).toBeInTheDocument();
    });
  });

  it('should validate last name max length', async () => {
    renderForm();

    const lastNameInput = screen.getByLabelText('Last Name');
    const longName = 'a'.repeat(51);
    fireEvent.change(lastNameInput, { target: { value: longName } });
    fireEvent.blur(lastNameInput);

    await waitFor(() => {
      expect(
        screen.getByText('Last name must be 50 characters or less'),
      ).toBeInTheDocument();
    });
  });

  it('should validate Strava profile URL format', async () => {
    renderForm();

    const stravaInput = screen.getByLabelText('Strava Profile');
    fireEvent.change(stravaInput, { target: { value: 'invalid-url' } });
    fireEvent.blur(stravaInput);

    await waitFor(() => {
      expect(
        screen.getByText('Invalid Strava profile URL'),
      ).toBeInTheDocument();
    });
  });

  it('should validate Instagram profile URL format', async () => {
    renderForm();

    const instagramInput = screen.getByLabelText('Instagram Profile');
    fireEvent.change(instagramInput, { target: { value: 'invalid-url' } });
    fireEvent.blur(instagramInput);

    await waitFor(() => {
      expect(
        screen.getByText('Invalid Instagram profile URL'),
      ).toBeInTheDocument();
    });
  });

  it('should accept valid Strava URL', async () => {
    renderForm();

    const stravaInput = screen.getByLabelText('Strava Profile');
    fireEvent.change(stravaInput, {
      target: { value: 'https://www.strava.com/athletes/67890' },
    });
    fireEvent.blur(stravaInput);

    await waitFor(() => {
      expect(
        screen.queryByText('Invalid Strava profile URL'),
      ).not.toBeInTheDocument();
    });
  });

  it('should accept valid Instagram URL', async () => {
    renderForm();

    const instagramInput = screen.getByLabelText('Instagram Profile');
    fireEvent.change(instagramInput, {
      target: { value: 'https://www.instagram.com/user_name123' },
    });
    fireEvent.blur(instagramInput);

    await waitFor(() => {
      expect(
        screen.queryByText('Invalid Instagram profile URL'),
      ).not.toBeInTheDocument();
    });
  });

  it('should accept empty Strava URL (optional field)', async () => {
    renderForm();

    const stravaInput = screen.getByLabelText('Strava Profile');
    fireEvent.change(stravaInput, { target: { value: '' } });
    fireEvent.blur(stravaInput);

    await waitFor(() => {
      expect(
        screen.queryByText('Invalid Strava profile URL'),
      ).not.toBeInTheDocument();
    });
  });

  it('should accept empty Instagram URL (optional field)', async () => {
    renderForm();

    const instagramInput = screen.getByLabelText('Instagram Profile');
    fireEvent.change(instagramInput, { target: { value: '' } });
    fireEvent.blur(instagramInput);

    await waitFor(() => {
      expect(
        screen.queryByText('Invalid Instagram profile URL'),
      ).not.toBeInTheDocument();
    });
  });

  it('should validate date of birth for age requirement', async () => {
    renderForm();

    const dateInput = screen.getByLabelText('Date of Birth');
    const today = new Date();
    const underageDate = new Date(
      today.getFullYear() - 10,
      today.getMonth(),
      today.getDate(),
    );
    const formattedDate = underageDate.toISOString().split('T')[0];

    fireEvent.change(dateInput, { target: { value: formattedDate } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(
        screen.getByText('You must be at least 13 years old'),
      ).toBeInTheDocument();
    });
  });

  it('should render with user that has no social links', () => {
    const userWithoutSocialLinks = {
      ...mockUser,
      stravaLink: undefined,
      instagramLink: undefined,
    };

    render(
      <MemoryRouter>
        <ProfileEditForm
          user={userWithoutSocialLinks}
          onUpdate={mockOnUpdate}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Strava Profile')).toHaveValue('');
    expect(screen.getByLabelText('Instagram Profile')).toHaveValue('');
  });

  it('should display selected sport types', () => {
    renderForm();

    // Sport types chips should be visible in the select
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Cycling')).toBeInTheDocument();
  });

  it('should open sport types dropdown when clicked', async () => {
    renderForm();

    const sportTypesSelect = screen.getByLabelText('Sport Types');
    fireEvent.mouseDown(sportTypesSelect);

    await waitFor(() => {
      // All sport type options should be visible
      expect(screen.getAllByText('Running').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should render privacy selectors', () => {
    renderForm();
    expect(screen.getByText('Email Privacy')).toBeInTheDocument();
  });
});

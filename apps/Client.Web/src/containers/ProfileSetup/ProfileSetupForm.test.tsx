import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { renderWithProviders as render } from '../../test-utils';
import { ProfileSetupForm } from './ProfileSetupForm';

describe('ProfileSetupForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) =>
    render(
      <MemoryRouter>
        <ProfileSetupForm
          defaultEmail=""
          defaultName=""
          isSubmitting={false}
          onSubmit={mockOnSubmit}
          {...props}
        />
      </MemoryRouter>,
    );

  it('should render all form fields', () => {
    renderForm();

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Nickname')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByLabelText('Sport Types')).toBeInTheDocument();
    expect(screen.getByLabelText('Strava Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram Profile')).toBeInTheDocument();
  });

  it('should render header with logo and title', () => {
    renderForm();

    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(
      screen.getByText('Set up your profile to get started'),
    ).toBeInTheDocument();
    expect(screen.getByAltText('BAAA Hub Logo')).toBeInTheDocument();
  });

  it('should pre-fill email when defaultEmail is provided', () => {
    renderForm({ defaultEmail: 'test@example.com' });

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveValue('test@example.com');
    expect(emailInput).toBeDisabled();
  });

  it('should pre-fill name when defaultName is provided', () => {
    renderForm({ defaultName: 'John Doe' });

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('should handle defaultName with only first name', () => {
    renderForm({ defaultName: 'John' });

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('');
  });

  it('should display error message when provided', () => {
    renderForm({ errorMessage: 'Something went wrong' });

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should disable submit button when isSubmitting is true', () => {
    renderForm({ isSubmitting: true });

    const submitButton = screen.getByRole('button', {
      name: /creating profile/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('should show "Creating Profile..." when isSubmitting is true', () => {
    renderForm({ isSubmitting: true });

    expect(
      screen.getByRole('button', { name: /creating profile/i }),
    ).toBeInTheDocument();
  });

  it('should show "Complete Setup" when not submitting', () => {
    renderForm({ isSubmitting: false });

    expect(
      screen.getByRole('button', { name: /complete setup/i }),
    ).toBeInTheDocument();
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

  it('should validate required nickname', async () => {
    renderForm();

    const nicknameInput = screen.getByLabelText('Nickname');
    fireEvent.change(nicknameInput, { target: { value: '' } });
    fireEvent.blur(nicknameInput);

    await waitFor(() => {
      expect(screen.getByText('Nickname is required')).toBeInTheDocument();
    });
  });

  it('should validate nickname minimum length', async () => {
    renderForm();

    const nicknameInput = screen.getByLabelText('Nickname');
    fireEvent.change(nicknameInput, { target: { value: 'ab' } });
    fireEvent.blur(nicknameInput);

    await waitFor(() => {
      expect(
        screen.getByText('Nickname must be at least 3 characters'),
      ).toBeInTheDocument();
    });
  });

  it('should validate nickname maximum length', async () => {
    renderForm();

    const nicknameInput = screen.getByLabelText('Nickname');
    const longNickname = 'a'.repeat(31);
    fireEvent.change(nicknameInput, { target: { value: longNickname } });
    fireEvent.blur(nicknameInput);

    await waitFor(() => {
      expect(
        screen.getByText('Nickname must be 30 characters or less'),
      ).toBeInTheDocument();
    });
  });

  it('should validate nickname pattern', async () => {
    renderForm();

    const nicknameInput = screen.getByLabelText('Nickname');
    fireEvent.change(nicknameInput, { target: { value: 'invalid-nick!' } });
    fireEvent.blur(nicknameInput);

    await waitFor(() => {
      expect(
        screen.getByText('Only letters, numbers, and underscores allowed'),
      ).toBeInTheDocument();
    });
  });

  it('should validate required email', async () => {
    renderForm();

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderForm();

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('should validate required date of birth', async () => {
    renderForm();

    const dateInput = screen.getByLabelText('Date of Birth');
    fireEvent.change(dateInput, { target: { value: '' } });
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
    });
  });

  it('should validate age requirement', async () => {
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

    // Submit to trigger validation
    const submitButton = screen.getByRole('button', {
      name: /complete setup/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('You must be at least 13 years old'),
      ).toBeInTheDocument();
    });
  });

  it('should validate sport types selection', async () => {
    renderForm();

    // Submit without selecting sport types
    const submitButton = screen.getByRole('button', {
      name: /complete setup/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Select at least one sport type'),
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
      target: { value: 'https://www.strava.com/athletes/12345' },
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
      target: { value: 'https://www.instagram.com/user_name' },
    });
    fireEvent.blur(instagramInput);

    await waitFor(() => {
      expect(
        screen.queryByText('Invalid Instagram profile URL'),
      ).not.toBeInTheDocument();
    });
  });

  it('should render avatar with initials based on input', async () => {
    renderForm();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });

    await waitFor(() => {
      expect(screen.getByText('JS')).toBeInTheDocument();
    });
  });

  it('should render avatar with ? when no name is entered', () => {
    renderForm();

    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should display helper text for nickname', () => {
    renderForm();

    expect(
      screen.getByText('This will be your public username'),
    ).toBeInTheDocument();
  });

  it('should display helper text for date of birth', () => {
    renderForm();

    expect(
      screen.getByText('You must be at least 13 years old'),
    ).toBeInTheDocument();
  });

  it('should display helper text for sport types', () => {
    renderForm();

    expect(
      screen.getByText('Select the sports you participate in'),
    ).toBeInTheDocument();
  });

  it('should display Social Links section', () => {
    renderForm();

    expect(screen.getByText('Social Links (Optional)')).toBeInTheDocument();
  });

  it('should display helper text for Strava profile', () => {
    renderForm();

    expect(
      screen.getByText('Link to your Strava athlete profile'),
    ).toBeInTheDocument();
  });

  it('should display helper text for Instagram profile', () => {
    renderForm();

    expect(
      screen.getByText('Link to your Instagram profile'),
    ).toBeInTheDocument();
  });

  it('should open sport types dropdown and display all options', async () => {
    renderForm();

    const sportTypesSelect = screen.getByLabelText('Sport Types');
    fireEvent.mouseDown(sportTypesSelect);

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Cycling')).toBeInTheDocument();
      expect(screen.getByText('Swimming')).toBeInTheDocument();
      expect(screen.getByText('Triathlon')).toBeInTheDocument();
      expect(screen.getByText('Trail Running')).toBeInTheDocument();
      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Walking')).toBeInTheDocument();
      expect(screen.getByText('Gym')).toBeInTheDocument();
      expect(screen.getByText('CrossFit')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
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
});

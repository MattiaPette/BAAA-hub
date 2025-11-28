import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router';
import { SportType } from '@baaa-hub/shared-types';
import { renderWithProviders as render } from '../../test-utils';
import { ProfileSetupForm } from './ProfileSetupForm';
import * as userService from '../../services/userService';

// Mock scrollIntoView since it's not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock the userService
vi.mock('../../services/userService', () => ({
  checkNicknameAvailability: vi.fn(),
}));

describe('ProfileSetupForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: nickname is available
    vi.mocked(userService.checkNicknameAvailability).mockResolvedValue({
      available: true,
      nickname: 'johndoe',
    });
  });

  const mockOnLogout = vi.fn();

  const renderForm = (props = {}) =>
    render(
      <MemoryRouter>
        <ProfileSetupForm
          defaultEmail=""
          defaultName=""
          isSubmitting={false}
          onSubmit={mockOnSubmit}
          onLogout={mockOnLogout}
          {...props}
        />
      </MemoryRouter>,
    );

  const fillStep0 = async (
    name = 'John',
    surname = 'Doe',
    nickname = 'johndoe',
    dob = '2000-01-01',
  ) => {
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: name },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: surname },
    });
    fireEvent.change(screen.getByLabelText(/Nickname/i), {
      target: { value: nickname },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: dob },
    });
    fireEvent.blur(screen.getByLabelText(/Date of Birth/i));
  };

  const goToNextStep = async () => {
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    // Wait for the next step to appear (animation or state update)
    await waitFor(() => expect(nextButton).not.toBeDisabled());
  };

  const closeSelect = () => {
    // Click the backdrop to close the select menu
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
    } else {
      // Fallback if backdrop is not found (e.g. if not open)
      fireEvent.keyDown(document.body, { key: 'Escape' });
    }
  };

  it('should render step 1 (Personal Details) initially', () => {
    renderForm();

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nickname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument();

    // Should not render fields from other steps
    expect(screen.queryByLabelText(/Favorite Sports/i)).not.toBeInTheDocument();
  });

  it('should validate step 1 before moving to step 2', async () => {
    renderForm();

    // Try to go next without filling fields
    await goToNextStep();

    // Should show validation errors
    expect(
      await screen.findByText(/First name is required/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Nickname is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Date of birth is required/i)).toBeInTheDocument();

    // Should still be on step 1
    expect(screen.queryByLabelText(/Favorite Sports/i)).not.toBeInTheDocument();
  });

  it('should navigate to step 2 (Sports) after valid step 1', async () => {
    renderForm();

    await fillStep0();
    await goToNextStep();

    // Should be on step 2
    expect(
      await screen.findByLabelText(/Favorite Sports/i),
    ).toBeInTheDocument();
  });

  it('should validate step 2 before moving to step 3', async () => {
    renderForm();

    await fillStep0();
    await goToNextStep();

    // Try to go next without selecting sports
    await goToNextStep();

    // Should show validation error
    expect(
      await screen.findByText(/Please select at least one sport/i),
    ).toBeInTheDocument();
  });

  it('should navigate to step 3 (Contact) after valid step 2', async () => {
    renderForm();

    await fillStep0();
    await goToNextStep();

    // Select a sport
    const select = await screen.findByLabelText(/Favorite Sports/i);
    fireEvent.mouseDown(select);
    const option = await screen.findByText('Running');
    fireEvent.click(option);
    closeSelect();

    await goToNextStep();

    // Should be on step 3
    expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Strava Profile URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instagram Profile URL/i)).toBeInTheDocument();
  });

  it('should validate step 3 before moving to step 4', async () => {
    renderForm();

    await fillStep0();
    await goToNextStep();

    // Select sport
    const select = await screen.findByLabelText(/Favorite Sports/i);
    fireEvent.mouseDown(select);
    const option = await screen.findByText('Running');
    fireEvent.click(option);
    closeSelect();

    await goToNextStep();

    // Try to enter invalid Strava URL
    const stravaInput = await screen.findByLabelText(/Strava Profile URL/i);
    fireEvent.change(stravaInput, { target: { value: 'invalid-url' } });

    await goToNextStep();

    expect(
      await screen.findByText(/Invalid Strava profile URL/i),
    ).toBeInTheDocument();
  });

  it('should navigate to step 4 (Privacy) after valid step 3', async () => {
    renderForm({ defaultEmail: 'test@example.com' });

    await fillStep0();
    await goToNextStep();

    // Select sport
    const select = await screen.findByLabelText(/Favorite Sports/i);
    fireEvent.mouseDown(select);
    const option = await screen.findByText('Running');
    fireEvent.click(option);
    closeSelect();

    await goToNextStep();

    // Email is pre-filled, so just go next
    await goToNextStep();

    // Should be on step 4
    expect(
      await screen.findByText(/Who can see your information\?/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Privacy/i)).toBeInTheDocument();
  });

  it('should submit the form on the last step', async () => {
    renderForm({ defaultEmail: 'test@example.com' });

    // Step 1
    await fillStep0();
    await goToNextStep();

    // Step 2
    const select = await screen.findByLabelText(/Favorite Sports/i);
    fireEvent.mouseDown(select);
    const option = await screen.findByText('Running');
    fireEvent.click(option);
    closeSelect();
    await goToNextStep();

    // Step 3
    await goToNextStep();

    // Step 4
    const submitButton = await screen.findByRole('button', {
      name: /Create Profile/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Check submitted data structure
    const submittedData = mockOnSubmit.mock.calls[0][0];
    expect(submittedData).toMatchObject({
      name: 'John',
      surname: 'Doe',
      nickname: 'johndoe',
      dateOfBirth: '2000-01-01',
      email: 'test@example.com',
      sportTypes: [SportType.RUNNING],
    });
  });

  it('should pre-fill name and email correctly', () => {
    renderForm({ defaultName: 'Jane Doe', defaultEmail: 'jane@example.com' });

    expect(screen.getByLabelText(/First Name/i)).toHaveValue('Jane');
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe');
  });

  describe('nickname availability', () => {
    it('should show available indicator when nickname is available', async () => {
      vi.mocked(userService.checkNicknameAvailability).mockResolvedValue({
        available: true,
        nickname: 'validnick',
      });

      renderForm();

      // Enter a valid nickname
      const nicknameInput = screen.getByLabelText(/Nickname/i);
      fireEvent.change(nicknameInput, { target: { value: 'validnick' } });

      // Wait for the debounced check and the available message
      await waitFor(
        () => {
          expect(
            screen.getByText(/This nickname is available/i),
          ).toBeInTheDocument();
        },
        { timeout: 1000 },
      );

      // Verify the API was called with lowercase nickname
      expect(userService.checkNicknameAvailability).toHaveBeenCalledWith(
        'validnick',
      );
    });

    it('should show error when nickname is already taken', async () => {
      vi.mocked(userService.checkNicknameAvailability).mockResolvedValue({
        available: false,
        nickname: 'takennick',
      });

      renderForm();

      // Enter a taken nickname
      const nicknameInput = screen.getByLabelText(/Nickname/i);
      fireEvent.change(nicknameInput, { target: { value: 'takennick' } });

      // Wait for the debounced check and the taken message
      await waitFor(
        () => {
          expect(
            screen.getByText(/This nickname is already taken/i),
          ).toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });

    it('should not check availability for nicknames shorter than 3 characters', async () => {
      renderForm();

      // Enter a short nickname
      const nicknameInput = screen.getByLabelText(/Nickname/i);
      fireEvent.change(nicknameInput, { target: { value: 'ab' } });

      // Wait a bit to ensure no API call is made
      await new Promise(resolve => {
        setTimeout(resolve, 600);
      });

      expect(userService.checkNicknameAvailability).not.toHaveBeenCalled();
    });

    it('should prevent moving to next step when nickname is taken', async () => {
      vi.mocked(userService.checkNicknameAvailability).mockResolvedValue({
        available: false,
        nickname: 'takennick',
      });

      renderForm();

      // Fill in valid data with a taken nickname
      fireEvent.change(screen.getByLabelText(/First Name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/Last Name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/Nickname/i), {
        target: { value: 'takennick' },
      });
      fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
        target: { value: '2000-01-01' },
      });
      fireEvent.blur(screen.getByLabelText(/Date of Birth/i));

      // Wait for nickname availability check
      await waitFor(
        () => {
          expect(
            screen.getByText(/This nickname is already taken/i),
          ).toBeInTheDocument();
        },
        { timeout: 1000 },
      );

      // Try to go to next step
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Should still be on step 1
      await waitFor(() => {
        expect(
          screen.queryByLabelText(/Favorite Sports/i),
        ).not.toBeInTheDocument();
      });
    });

    it('should normalize nickname to lowercase before checking', async () => {
      vi.mocked(userService.checkNicknameAvailability).mockResolvedValue({
        available: true,
        nickname: 'johndoe',
      });

      renderForm();

      // Enter a nickname with mixed case
      const nicknameInput = screen.getByLabelText(/Nickname/i);
      fireEvent.change(nicknameInput, { target: { value: 'JohnDoe' } });

      // Wait for the debounced check
      await waitFor(
        () => {
          expect(userService.checkNicknameAvailability).toHaveBeenCalledWith(
            'johndoe',
          );
        },
        { timeout: 1000 },
      );
    });
  });
});

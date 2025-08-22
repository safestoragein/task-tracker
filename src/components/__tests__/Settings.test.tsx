import { screen, fireEvent } from '@testing-library/react'
import { render } from '../../__tests__/test-utils'
import { Settings } from '../Settings'

const mockUser = {
  id: '1',
  name: 'Ramesh',
  email: 'ramesh@safestorage.in',
  role: 'CEO',
  userRole: 'admin' as const,
}

describe('Settings Component', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
  })

  test('renders settings page correctly', () => {
    render(<Settings />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(
      screen.getByText('Manage your SafeStorage preferences and account settings')
    ).toBeInTheDocument()
    expect(screen.getByText('Save Settings')).toBeInTheDocument()
  })

  test('displays profile information', () => {
    render(<Settings />)

    expect(screen.getByText('Profile Information')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  test('shows notification settings', () => {
    render(<Settings />)

    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    expect(screen.getByText('Task Deadline Reminders')).toBeInTheDocument()
    expect(screen.getByText('Daily Digest')).toBeInTheDocument()
    expect(screen.getByText('Team Updates')).toBeInTheDocument()
  })

  test('displays appearance preferences', () => {
    render(<Settings />)

    expect(screen.getByText('Appearance & Preferences')).toBeInTheDocument()
    expect(screen.getByText('Default View')).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Timezone')).toBeInTheDocument()
    expect(screen.getByText('Date Format')).toBeInTheDocument()
  })

  test('shows privacy settings', () => {
    render(<Settings />)

    expect(screen.getByText('Privacy & Security')).toBeInTheDocument()
    expect(screen.getByText('Profile Visibility')).toBeInTheDocument()
    expect(screen.getByText('Task Visibility')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  test.skip('shows data management for admin users', () => {
    render(<Settings />)

    expect(screen.getByText('Data Management')).toBeInTheDocument()
    expect(screen.getByText('Export Data')).toBeInTheDocument()
    expect(screen.getByText('Clear All Data')).toBeInTheDocument()
  })

  test('save button functionality', async () => {
    render(<Settings />)

    const saveButton = screen.getByText('Save Settings')
    fireEvent.click(saveButton)

    // Should show saving state
    expect(localStorage.setItem).toHaveBeenCalled()
  })
})

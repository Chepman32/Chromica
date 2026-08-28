import React, { type ReactNode } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import SettingsScreen from '../SettingsScreen';

const goBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../stores/appStore', () => ({
  useAppStore: jest.fn(() => ({
    preferences: {
      theme: 'light',
      language: 'en',
      hapticFeedback: false,
      confirmDelete: true,
    },
    updatePreferences: jest.fn(),
    resetOnboarding: jest.fn(),
  })),
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    backgrounds: {
      primary: '#000000',
      secondary: '#111111',
      tertiary: '#222222',
    },
    text: { primary: '#ffffff', secondary: '#cccccc', tertiary: '#999999' },
    accent: { primary: '#00ff00' },
    semantic: { error: '#ff0000' },
  }),
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    common: { back: 'Back', cancel: 'Cancel', delete: 'Delete' },
    mixes: { reset: 'Reset' },
    ui: {
      notifications: {
        title: 'notifications',
        description: 'notificationsDesc',
      },
    },
    settings: new Proxy(
      {},
      { get: (_target, property) => String(property) },
    ),
  }),
}));

jest.mock('../../utils/haptics', () => ({ triggerHaptic: jest.fn() }));

jest.mock(
  '../../services/notifications',
  () => ({
    getNotificationPermissionStatus: jest.fn(),
    requestNotificationPermissionFromSettings: jest.fn(),
  }),
);

const {
  getNotificationPermissionStatus: mockGetNotificationPermissionStatus,
  requestNotificationPermissionFromSettings: mockRequestNotificationPermissionFromSettings,
} = jest.requireMock('../../services/notifications') as {
  getNotificationPermissionStatus: jest.Mock;
  requestNotificationPermissionFromSettings: jest.Mock;
};

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: ({ children }: { children: ReactNode }) => <View>{children}</View> };
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ goBack });
    mockGetNotificationPermissionStatus.mockResolvedValue(false);
    mockRequestNotificationPermissionFromSettings.mockResolvedValue(false);
  });

  it('returns to the previous screen when the localized back button is pressed', async () => {
    const { getByRole } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    fireEvent.press(getByRole('button', { name: 'Back' }));

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('offers a notification-permission retry when notifications are denied', async () => {
    const { getByRole } = render(<SettingsScreen />);

    const notificationsSwitch = await waitFor(() =>
      getByRole('switch', { name: 'notifications' }),
    );
    fireEvent(notificationsSwitch, 'valueChange', true);

    await waitFor(() =>
      expect(mockRequestNotificationPermissionFromSettings).toHaveBeenCalledTimes(1),
    );
  });

  it('does not offer a reset-onboarding action', async () => {
    const { queryByText } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    expect(queryByText('resetOnboarding')).toBeNull();
  });
});

import React, { type ReactNode } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import SettingsScreen from '../SettingsScreen';

const goBack = jest.fn();
const mockUpdatePreferences = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../stores/appStore', () => ({
  useAppStore: jest.fn(),
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
    common: { back: 'Back', close: 'Close', cancel: 'Cancel', delete: 'Delete' },
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
const { useAppStore: mockUseAppStore } = jest.requireMock('../../stores/appStore') as {
  useAppStore: jest.Mock;
};
const { triggerHaptic: mockTriggerHaptic } = jest.requireMock('../../utils/haptics') as {
  triggerHaptic: jest.Mock;
};

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: { children: ReactNode }) => (
      <View testID="settings-safe-area" {...props}>
        {children}
      </View>
    ),
  };
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AppState.addEventListener as jest.Mock).mockReturnValue({
      remove: jest.fn(),
    });
    (useNavigation as jest.Mock).mockReturnValue({ goBack });
    mockUseAppStore.mockReturnValue({
      preferences: {
        theme: 'light',
        language: 'en',
        hapticFeedback: false,
        confirmDelete: true,
      },
      updatePreferences: mockUpdatePreferences,
    });
    mockGetNotificationPermissionStatus.mockResolvedValue(false);
    mockRequestNotificationPermissionFromSettings.mockResolvedValue(false);
  });

  it('closes the screen with the same close control used by Recents', async () => {
    const { getByRole, getByText, queryByRole, queryByText } = render(
      <SettingsScreen />,
    );

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    expect(getByText('✕')).toBeTruthy();
    expect(queryByText('←')).toBeNull();
    expect(queryByRole('button', { name: 'Back' })).toBeNull();

    fireEvent.press(getByRole('button', { name: 'Close' }));

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('keeps the header below the status bar safe area', async () => {
    const { getByTestId } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    expect(getByTestId('settings-safe-area').props.edges).toEqual(
      expect.arrayContaining(['top', 'bottom']),
    );
  });

  it('offers a notification-permission retry when notifications are denied', async () => {
    const { getByRole, getByText } = render(<SettingsScreen />);

    await waitFor(() => getByRole('switch', { name: 'notifications' }));
    fireEvent.press(getByText('notifications'));

    await waitFor(() =>
      expect(mockRequestNotificationPermissionFromSettings).toHaveBeenCalledTimes(1),
    );

    expect(getByRole('switch', { name: 'notifications' })).toBeTruthy();
  });

  it('ignores attempts to turn off a denied notification permission', async () => {
    const { getByRole } = render(<SettingsScreen />);

    const notificationsSwitch = await waitFor(() =>
      getByRole('switch', { name: 'notifications' }),
    );
    fireEvent(notificationsSwitch, 'valueChange', false);

    expect(mockRequestNotificationPermissionFromSettings).not.toHaveBeenCalled();
  });

  it('refreshes notification permission after returning from system settings', async () => {
    const { unmount } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    const handleAppStateChange = (AppState.addEventListener as jest.Mock).mock
      .calls[0][1] as (
      state: AppStateStatus,
    ) => void;
    act(() => handleAppStateChange('background'));
    expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1);

    act(() => handleAppStateChange('active'));
    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(2),
    );

    unmount();
  });

  it('hides the notification-permission switch when notifications are allowed', async () => {
    mockGetNotificationPermissionStatus.mockResolvedValue(true);
    const { queryByRole } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    expect(queryByRole('switch', { name: 'notifications' })).toBeNull();
  });

  it('updates switch preferences', async () => {
    mockUseAppStore.mockReturnValue({
      preferences: {
        theme: 'light',
        language: 'en',
        hapticFeedback: true,
        confirmDelete: true,
      },
      updatePreferences: mockUpdatePreferences,
    });
    const { getAllByRole } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    const [hapticsSwitch, confirmDeleteSwitch] = getAllByRole('switch');
    fireEvent(hapticsSwitch, 'valueChange', false);
    fireEvent(confirmDeleteSwitch, 'valueChange', false);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ hapticFeedback: false });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ confirmDelete: false });
    expect(mockTriggerHaptic).toHaveBeenCalledWith('selection');
  });

  it('updates the selected theme and language', async () => {
    mockUseAppStore.mockReturnValue({
      preferences: {
        theme: 'light',
        language: 'en',
        hapticFeedback: true,
        confirmDelete: true,
      },
      updatePreferences: mockUpdatePreferences,
    });
    const { getByText } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    fireEvent.press(getByText('theme'));
    fireEvent.press(getByText('themeDark'));
    fireEvent.press(getByText('language'));
    fireEvent.press(getByText('Deutsch'));

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ theme: 'dark' });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ language: 'de' });
    expect(mockTriggerHaptic).toHaveBeenCalledTimes(2);
  });

  it('shows the maintenance action confirmations', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    fireEvent.press(getByText('exportAllProjects'));
    expect(alertSpy).toHaveBeenLastCalledWith(
      'exportAllProjects',
      'exportAllProjectsDesc',
    );

    fireEvent.press(getByText('clearCache'));
    const clearButtons = alertSpy.mock.calls.at(-1)?.[2];
    clearButtons?.[1]?.onPress?.();
    expect(alertSpy).toHaveBeenLastCalledWith('clearCache');

    fireEvent.press(getByText('deleteAllProjects'));
    const deleteButtons = alertSpy.mock.calls.at(-1)?.[2];
    deleteButtons?.[1]?.onPress?.();
    expect(alertSpy).toHaveBeenLastCalledWith('deleteAllProjects');
  });

  it('does not offer a reset-onboarding action', async () => {
    const { queryByText } = render(<SettingsScreen />);

    await waitFor(() =>
      expect(mockGetNotificationPermissionStatus).toHaveBeenCalledTimes(1),
    );

    expect(queryByText('resetOnboarding')).toBeNull();
  });
});

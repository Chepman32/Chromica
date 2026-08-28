jest.mock(
  '@notifee/react-native',
  () => ({
    __esModule: true,
    default: {
      createChannel: jest.fn(),
      cancelNotification: jest.fn(),
      createTriggerNotification: jest.fn(),
      getNotificationSettings: jest.fn(),
      requestPermission: jest.fn(),
      openNotificationSettings: jest.fn(),
    },
    AndroidImportance: { DEFAULT: 3 },
    AuthorizationStatus: { DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2 },
    TriggerType: { TIMESTAMP: 0 },
  }),
);

const { default: mockNotifee } = jest.requireMock('@notifee/react-native') as {
  default: {
    createChannel: jest.Mock;
    cancelNotification: jest.Mock;
    createTriggerNotification: jest.Mock;
    getNotificationSettings: jest.Mock;
    requestPermission: jest.Mock;
    openNotificationSettings: jest.Mock;
  };
};

import {
  INACTIVITY_NOTIFICATION_DELAY_MS,
  INACTIVITY_NOTIFICATION_ID,
  REENGAGEMENT_MESSAGES,
  requestNotificationPermissionFromSettings,
  scheduleInactivityNotification,
} from '../notifications';

describe('inactivity notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotifee.getNotificationSettings.mockResolvedValue({ authorizationStatus: 1 });
    mockNotifee.requestPermission.mockResolvedValue({ authorizationStatus: 1 });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('provides 50 unique creative re-engagement messages', () => {
    expect(REENGAGEMENT_MESSAGES).toHaveLength(50);
    expect(new Set(REENGAGEMENT_MESSAGES).size).toBe(50);
  });

  it('schedules one notification for exactly three weeks after the app backgrounds', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    jest.spyOn(Math, 'random').mockReturnValue(0);

    await scheduleInactivityNotification({
      channelName: 'Creative reminders',
      messages: REENGAGEMENT_MESSAGES,
    });

    expect(mockNotifee.cancelNotification).toHaveBeenCalledWith(INACTIVITY_NOTIFICATION_ID);
    expect(mockNotifee.createChannel).toHaveBeenCalledTimes(1);
    expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: INACTIVITY_NOTIFICATION_ID,
        body: REENGAGEMENT_MESSAGES[0],
      }),
      expect.objectContaining({
        timestamp: 1_000 + INACTIVITY_NOTIFICATION_DELAY_MS,
      }),
    );
  });

  it('does not schedule a reminder without notification permission', async () => {
    mockNotifee.getNotificationSettings.mockResolvedValue({ authorizationStatus: 0 });

    await scheduleInactivityNotification({
      channelName: 'Creative reminders',
      messages: REENGAGEMENT_MESSAGES,
    });

    expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
  });

  it('uses the localized channel name and reminder body supplied by the app', async () => {
    await scheduleInactivityNotification({
      channelName: 'Творческие напоминания',
      messages: ['Пора немного поколдовать над фотографиями'],
    });

    expect(mockNotifee.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Творческие напоминания' }),
    );
    expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'PixelFX',
        body: 'Пора немного поколдовать над фотографиями',
      }),
      expect.any(Object),
    );
  });

  it('opens system notification settings when a retry is still denied', async () => {
    mockNotifee.requestPermission.mockResolvedValue({ authorizationStatus: 0 });

    await expect(requestNotificationPermissionFromSettings()).resolves.toBe(false);

    expect(mockNotifee.openNotificationSettings).toHaveBeenCalledTimes(1);
  });
});

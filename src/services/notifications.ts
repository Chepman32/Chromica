import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';

export const INACTIVITY_NOTIFICATION_DELAY_MS = 21 * 24 * 60 * 60 * 1000;
export const INACTIVITY_NOTIFICATION_ID = 'creative-inactivity-reminder';

const CREATIVE_REMINDERS_CHANNEL_ID = 'creative-reminders';

export type InactivityNotificationCopy = {
  channelName: string;
  messages: readonly [string, ...string[]];
};

export const REENGAGEMENT_MESSAGES = [
  "Didn't see you for a while—let's mix something unexpected?",
  "It's time to make some magic. Open PixelFX and follow your imagination.",
  'Your next masterpiece might be one swipe away.',
  'A quiet photo is waiting for a wild new mood.',
  'Your camera roll has a secret. Want to reveal it?',
  'Give an ordinary image an extraordinary second life.',
  'A little creative chaos would look good on you today.',
  'Your next mix is already hiding in your gallery.',
  'Turn a spare minute into something beautifully strange.',
  'The colors are ready whenever you are.',
  'Make a photo feel like it came from another universe.',
  'Your imagination called—it wants to play with pixels.',
  'One image. Infinite directions. Which one will you choose?',
  'There is still magic left in that photo you almost deleted.',
  'Take a familiar picture somewhere unfamiliar.',
  'A fresh visual experiment is waiting in your pocket.',
  'Mix, twist, glow, repeat. Your canvas misses you.',
  'What happens when you let an image misbehave a little?',
  'Your gallery could use a plot twist.',
  'Open PixelFX and make something nobody saw coming.',
  'A tiny edit can start a very big idea.',
  'The next great texture is only a tap away.',
  'Ready to turn "nice photo" into "wait, how did you do that?"',
  'Bring back an old photo with a brand-new atmosphere.',
  'Your creative spark has been saving itself for today.',
  'There is no wrong way to make visual magic.',
  'Add a little wonder to the everyday.',
  'Find the strange, beautiful version of a photo you know by heart.',
  'A new mood is waiting to land on your favorite image.',
  'Make something dreamy, dramatic, or delightfully weird.',
  'Your next edit could become your new favorite thing.',
  'A blank moment is the perfect place for a visual experiment.',
  'Let one photo become a whole new world.',
  'There is an untold story inside your camera roll.',
  'Your creativity has excellent taste in surprises.',
  'Try one effect. Then see where the curiosity takes you.',
  'The ordinary is only the beginning.',
  'Make a memory feel more like a movie scene.',
  'Your photos deserve a little mischief.',
  'A fresh idea is easier to find when you start mixing.',
  'Create a mood no filter pack has seen before.',
  'Open the app. Break a rule. Make it beautiful.',
  'Your next creative detour starts with one image.',
  'Turn the familiar into something worth staring at.',
  'A good photo can become a great experiment.',
  'Give your imagination a canvas and five minutes.',
  'There is always another way to see the same picture.',
  'Make your gallery feel a little more alive.',
  'Your visual playground is ready when you are.',
  'Go make something only you would make.',
] as const;

const isAuthorized = (authorizationStatus: AuthorizationStatus) =>
  authorizationStatus === AuthorizationStatus.AUTHORIZED ||
  authorizationStatus === AuthorizationStatus.PROVISIONAL;

export const getNotificationPermissionStatus = async (): Promise<boolean> => {
  try {
    const settings = await notifee.getNotificationSettings();
    return isAuthorized(settings.authorizationStatus);
  } catch {
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const settings = await notifee.requestPermission();
    return isAuthorized(settings.authorizationStatus);
  } catch {
    return false;
  }
};

export const requestNotificationPermissionFromSettings = async (): Promise<boolean> => {
  const granted = await requestNotificationPermission();

  if (!granted) {
    await notifee.openNotificationSettings();
  }

  return granted;
};

export const cancelInactivityNotification = () =>
  notifee.cancelNotification(INACTIVITY_NOTIFICATION_ID);

export const scheduleInactivityNotification = async (
  copy: InactivityNotificationCopy,
): Promise<boolean> => {
  await cancelInactivityNotification();

  if (!(await getNotificationPermissionStatus())) {
    return false;
  }

  const channelId = await notifee.createChannel({
    id: CREATIVE_REMINDERS_CHANNEL_ID,
    name: copy.channelName,
    importance: AndroidImportance.DEFAULT,
  });
  const messageIndex = Math.min(
    copy.messages.length - 1,
    Math.floor(Math.random() * copy.messages.length),
  );

  await notifee.createTriggerNotification(
    {
      id: INACTIVITY_NOTIFICATION_ID,
      title: 'PixelFX',
      body: copy.messages[messageIndex],
      android: {
        channelId,
        pressAction: { id: 'default' },
      },
      ios: { sound: 'default' },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + INACTIVITY_NOTIFICATION_DELAY_MS,
    },
  );

  return true;
};

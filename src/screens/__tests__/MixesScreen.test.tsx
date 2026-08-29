import React, { type ReactNode } from 'react';
import { render } from '@testing-library/react-native';
import { MixesScreen } from '../MixesScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({ params: undefined }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: { children: ReactNode }) => (
      <View {...props}>{children}</View>
    ),
    useSafeAreaInsets: () => ({ bottom: 0 }),
  };
});

jest.mock('@shopify/react-native-skia', () => {
  const { View } = require('react-native');
  return {
    Canvas: View,
    Fill: View,
    Image: View,
    ImageShader: View,
    Shader: View,
    useCanvasRef: () => ({ current: null }),
    useImage: () => null,
  };
});

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/documents',
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('../../database/ProjectDatabase', () => ({
  ProjectDatabase: {
    create: jest.fn(),
    getById: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../../stores/projectGalleryStore', () => ({
  useProjectGalleryStore: () => ({ loadProjects: jest.fn() }),
}));

jest.mock('../../domain/effects/registry', () => ({ EFFECTS: [] }));

jest.mock('../../domain/shader-manager/ShaderManager', () => ({
  ShaderManager: { loadShader: jest.fn() },
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    effects: {
      categories: new Proxy({}, { get: () => 'category' }),
      names: new Proxy({}, { get: () => 'effect' }),
    },
    mixes: new Proxy(
      {
        noPhotoYet: 'No photo yet',
        pickImagePrompt: 'Choose a photo to begin',
        pickPhoto: 'Pick photo',
        reset: 'Сбросить',
        subtitle: 'Combine several filters',
        title: 'Mixes',
      },
      { get: (target, property) => target[property as keyof typeof target] ?? String(property) },
    ),
  }),
}));

describe('MixesScreen', () => {
  it('keeps the localized reset action on a single line', () => {
    const { getByText } = render(<MixesScreen />);

    expect(getByText('Сбросить').props.numberOfLines).toBe(1);
  });
});

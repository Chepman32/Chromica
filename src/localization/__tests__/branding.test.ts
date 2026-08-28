import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

const read = (relativePath: string): string =>
  fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');

describe('PixelFX branding', () => {
  it('uses PixelFX as the React Native application name', () => {
    expect(JSON.parse(read('app.json'))).toEqual({
      name: 'PixelFX',
      displayName: 'PixelFX',
    });
    expect(JSON.parse(read('package.json')).name).toBe('PixelFX');
  });

  it('uses PixelFX for Android branding and React Native registration', () => {
    expect(read('android/app/src/main/res/values/strings.xml')).toContain(
      '<string name="app_name">PixelFX</string>',
    );
    expect(read('android/app/src/main/java/com/pixelfx/MainActivity.kt')).toContain(
      'getMainComponentName(): String = "PixelFX"',
    );
  });

  it('uses PixelFX for iOS branding and React Native registration', () => {
    const infoPlist = read('ios/PixelFX/Info.plist');

    expect(infoPlist).toContain('<string>PixelFX</string>');
    expect(infoPlist).not.toContain('Corivo needs');
    expect(read('ios/PixelFX/AppDelegate.swift')).toContain(
      'withModuleName: "PixelFX"',
    );
  });

  it('uses PixelFX throughout user-visible app surfaces', () => {
    const brandFacingFiles = [
      'src/screens/PixelFXSplashScreen.tsx',
      'src/screens/HomeScreen.tsx',
      'src/screens/LiquidRadialHomeScreen.tsx',
      'src/services/notifications.ts',
      'src/localization/languages/en.ts',
      'Swift_version/PixelFX/Features/HomeView.swift',
      'Swift_version/PixelFX/Features/SplashOnboardingViews.swift',
      'Swift_version/PixelFX/Resources/Info.plist',
      'Swift_version/PixelFX/Resources/LaunchScreen.storyboard',
    ];

    brandFacingFiles.forEach(relativePath => {
      const contents = read(relativePath);
      expect(contents).toContain('PixelFX');
      expect(contents).not.toMatch(/\bCorivo\b|CORIVO/);
    });
  });
});

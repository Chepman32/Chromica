import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const CATALOG_PATH = path.join(
  PROJECT_ROOT,
  'ios/Corivo/InfoPlist.xcstrings',
);
const XCODE_PROJECT_PATH = path.join(
  PROJECT_ROOT,
  'ios/Corivo.xcodeproj/project.pbxproj',
);

const IOS_LOCALES = [
  'ar', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fil', 'fr', 'he', 'hi',
  'hu', 'id', 'it', 'ja', 'ko', 'ms', 'nb', 'nl', 'pl', 'pt', 'ro', 'ru',
  'sv', 'th', 'tr', 'uk', 'vi', 'zh-Hans',
];

const PERMISSION_KEYS = [
  'NSPhotoLibraryAddUsageDescription',
  'NSPhotoLibraryUsageDescription',
];

describe('native permission localization', () => {
  it('localizes every photo permission for every supported iOS locale', () => {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

    PERMISSION_KEYS.forEach(key => {
      const localizations = catalog.strings[key].localizations;
      expect(Object.keys(localizations).sort()).toEqual(IOS_LOCALES);
      IOS_LOCALES.forEach(locale => {
        expect(localizations[locale].stringUnit.value.trim()).not.toBe('');
      });
    });
  });

  it('bundles the Info.plist string catalog in the iOS target', () => {
    const project = fs.readFileSync(XCODE_PROJECT_PATH, 'utf8');

    expect(project).toContain('InfoPlist.xcstrings in Resources');
    expect(project).toContain('path = Corivo/InfoPlist.xcstrings;');
  });
});

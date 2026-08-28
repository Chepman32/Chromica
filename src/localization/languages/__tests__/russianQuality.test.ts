import { formatProjectTimestamp } from '../../formatters';
import { uiDefaults } from '../../uiDefaults';
import { effectParameterDefaults } from '../../effectParameterDefaults';
import { ru } from '../ru';

describe('Russian localization quality', () => {
  it('uses natural effect names and interface terminology', () => {
    expect(ru.effects.names['ocean-ripple']).toBe('Морская рябь');
    expect(ru.effects.names['rgb-split']).toBe('Разделение RGB-каналов');
    expect(ru.effects.names['unsharp-mask']).toBe('Контурная резкость');
    expect(ru.effects.categories.render).toBe('Генерация');
    expect(effectParameterDefaults.ru.colorShift).toBe('Сдвиг цвета');
    expect(effectParameterDefaults.ru.lightningType).toBe('Тип молнии');
    expect(ru.settings.resetOnboarding).toBe('Показать знакомство заново');
  });

  it('uses Russian plural forms in relative dates', () => {
    const now = new Date('2026-08-28T12:00:00.000Z');
    const fiveMinutesAgo = new Date('2026-08-28T11:55:00.000Z');

    expect(
      formatProjectTimestamp(fiveMinutesAgo, now, 'ru', uiDefaults.ru.projects),
    ).toBe('5 минут назад');
  });
});

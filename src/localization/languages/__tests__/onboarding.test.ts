import { ru } from '../ru';

describe('Russian onboarding copy', () => {
  it('promotes 4K export', () => {
    expect(ru.onboarding.feature4KExport).toBe('Экспорт 4K');
  });
});

import { en } from '../languages/en';
import { ru } from '../languages/ru';

describe('Settings recents copy', () => {
  it('uses Remove all recents in English', () => {
    expect(en.settings.deleteAllProjects).toBe('Remove all recents');
    expect(en.settings.deleteAllProjectsDesc).toBe(
      'Remove all projects from Recents',
    );
  });

  it('uses the equivalent recents wording in Russian', () => {
    expect(ru.settings.deleteAllProjects).toBe('Удалить всё из недавних');
    expect(ru.settings.deleteAllProjectsDesc).toBe(
      'Удалить все проекты из списка недавних',
    );
  });
});

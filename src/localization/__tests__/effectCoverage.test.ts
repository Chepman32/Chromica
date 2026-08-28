import { EFFECTS } from '../../domain/effects/registry';
import { translations } from '../index';
import { effectParameterDefaults } from '../effectParameterDefaults';

describe('effect localization coverage', () => {
  const effectIds = [...new Set(EFFECTS.map(effect => effect.id))];
  const parameterNames = [
    ...new Set(
      EFFECTS.flatMap(effect =>
        effect.parameters.map(parameter => parameter.name),
      ),
    ),
  ];
  const optionNames = [
    ...new Set(
      EFFECTS.flatMap(effect =>
        effect.parameters.flatMap(parameter =>
          (parameter.options ?? []).map(option => String(option).toLowerCase()),
        ),
      ),
    ),
  ];

  Object.entries(translations).forEach(([language, translation]) => {
    it(`${language} covers every effect, parameter, and option`, () => {
      const parameters = {
        ...translation.effects.parameters,
        ...effectParameterDefaults[
          language as keyof typeof effectParameterDefaults
        ],
      };
      expect({
        effects: effectIds.filter(
          effectId => !(effectId in translation.effects.names),
        ),
        parameters: parameterNames.filter(
          parameterName => !(parameterName in parameters),
        ),
        options: optionNames.filter(
          optionName => !(optionName in translation.effects.options),
        ),
      }).toEqual({ effects: [], parameters: [], options: [] });
    });
  });
});

import Foundation

final class EffectRegistry {
    let effects: [EffectDefinition]
    let effectMap: [String: EffectDefinition]
    let categories: [EffectCategory] = [
        .cellular,
        .tiling,
        .distortion,
        .glass,
        .correction,
        .blurSharpen,
        .glitch,
        .relief,
        .stylization,
        .brush,
        .frequency,
        .render,
    ]

    init(bundle: Bundle = .main) {
        guard
            let url = bundle.url(forResource: "effects", withExtension: "json", subdirectory: "Generated"),
            let data = try? Data(contentsOf: url),
            let catalog = try? JSONDecoder().decode(EffectCatalog.self, from: data)
        else {
            self.effects = []
            self.effectMap = [:]
            return
        }

        self.effects = catalog.effects
        self.effectMap = Dictionary(uniqueKeysWithValues: catalog.effects.map { ($0.id, $0) })
    }

    func effect(id: String) -> EffectDefinition? {
        effectMap[id]
    }

    func effects(for category: EffectCategory) -> [EffectDefinition] {
        effects.filter { $0.category == category }
    }

    func mixableEffects(for category: EffectCategory) -> [EffectDefinition] {
        effects.filter { $0.category == category && $0.shaderPath != nil }
    }

    func defaultParameters(for effectID: String) -> [String: EffectValue] {
        guard let effect = effectMap[effectID] else { return [:] }
        return Dictionary(uniqueKeysWithValues: effect.parameters.map { ($0.name, $0.defaultValue) })
    }
}

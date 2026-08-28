import Combine
import Foundation
import SwiftUI

@MainActor
final class AppModel: ObservableObject {
    @Published var hasSeenOnboarding: Bool
    @Published var preferences: UserPreferences {
        didSet { persistPreferences() }
    }

    let localization: LocalizationManager
    let effectRegistry: EffectRegistry
    let projectStore: ProjectStore
    let renderPipeline: RenderPipeline

    private let defaults = UserDefaults.standard
    private let preferencesKey = "corivo.swift.preferences"
    private let onboardingKey = "corivo.swift.onboarding"

    init() {
        let deviceLanguage = AppModel.detectDeviceLanguage()
        self.localization = LocalizationManager()
        self.effectRegistry = EffectRegistry()
        self.projectStore = ProjectStore()
        self.renderPipeline = RenderPipeline()

        if
            let data = defaults.data(forKey: preferencesKey),
            let preferences = try? JSONDecoder().decode(UserPreferences.self, from: data)
        {
            self.preferences = preferences
        } else {
            self.preferences = UserPreferences.defaultValue(deviceLanguage: deviceLanguage)
        }

        self.hasSeenOnboarding = defaults.object(forKey: onboardingKey) as? Bool ?? false

        if let migration = MigrationCoordinator().performIfNeeded(defaultLanguage: deviceLanguage) {
            if let migratedPreferences = migration.preferences {
                self.preferences = migratedPreferences
            }
            if let migratedOnboarding = migration.hasSeenOnboarding {
                self.hasSeenOnboarding = migratedOnboarding
            }
            projectStore.importMigration(migration)
            persistPreferences()
            persistOnboarding()
        }
    }

    var theme: CorivoTheme {
        CorivoDesign.themes[preferences.theme] ?? CorivoDesign.themes[.dark]!
    }

    var currentLanguage: String {
        preferences.language
    }

    func text(_ keyPath: String, fallback: String = "") -> String {
        localization.text(keyPath, language: preferences.language, fallback: fallback)
    }

    func effectName(_ effect: EffectDefinition) -> String {
        text("effects.names.\(effect.id)", fallback: effect.name)
    }

    func categoryName(_ category: EffectCategory) -> String {
        let key: String
        switch category {
        case .blurSharpen:
            key = "blurSharpen"
        default:
            key = category.rawValue
        }
        return text("effects.categories.\(key)", fallback: category.rawValue.capitalized)
    }

    func parameterLabel(_ parameter: EffectParameterDefinition) -> String {
        text("effects.parameters.\(parameter.name)", fallback: parameter.label)
    }

    func optionLabel(_ option: String) -> String {
        let trimmed = option
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: " ", with: "")
        let normalized = trimmed.isEmpty
            ? option
            : trimmed.prefix(1).lowercased() + String(trimmed.dropFirst())
        return text("effects.options.\(normalized)", fallback: option)
    }

    func setTheme(_ theme: ThemeType) {
        preferences.theme = theme
    }

    func setLanguage(_ language: String) {
        preferences.language = language
    }

    func setOnboardingSeen() {
        hasSeenOnboarding = true
        persistOnboarding()
    }

    func resetOnboarding() {
        hasSeenOnboarding = false
        preferences.language = AppModel.detectDeviceLanguage()
        persistOnboarding()
    }

    func updateAutoSave(_ enabled: Bool) {
        preferences.autoSaveProjects = enabled
    }

    func updateHaptics(_ enabled: Bool) {
        preferences.hapticFeedback = enabled
    }

    func updateSound(_ enabled: Bool) {
        preferences.soundEnabled = enabled
    }

    func updateConfirmDelete(_ enabled: Bool) {
        preferences.confirmDelete = enabled
    }

    func updateExportFormat(_ format: ExportFormat) {
        preferences.defaultExportFormat = format
    }

    func updateExportQuality(_ quality: Double) {
        preferences.defaultExportQuality = quality
    }

    private func persistPreferences() {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(preferences) {
            defaults.set(data, forKey: preferencesKey)
        }
    }

    private func persistOnboarding() {
        defaults.set(hasSeenOnboarding, forKey: onboardingKey)
    }

    private static func detectDeviceLanguage() -> String {
        let map: [String: String] = [
            "tl": "fil",
        ]
        let code = Locale.current.languageCode?.lowercased() ?? "en"
        return map[code] ?? code
    }
}

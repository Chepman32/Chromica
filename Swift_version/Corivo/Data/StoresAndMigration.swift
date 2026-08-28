import Combine
import Foundation
import UIKit

struct MigrationResult {
    var hasSeenOnboarding: Bool?
    var preferences: UserPreferences?
    var presets: [EffectPreset]
    var projects: [ProjectRecord]
}

@MainActor
final class ProjectStore: ObservableObject {
    @Published private(set) var projects: [ProjectRecord] = []
    @Published private(set) var presets: [EffectPreset] = []

    private let fileManager: FileManager
    private let baseDirectory: URL
    private let projectsURL: URL
    private let presetsURL: URL
    private let thumbnailsDirectory: URL
    private let exportsDirectory: URL

    init(fileManager: FileManager = .default, baseDirectoryOverride: URL? = nil) {
        self.fileManager = fileManager

        let applicationSupport = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        self.baseDirectory = baseDirectoryOverride ?? applicationSupport.appendingPathComponent("CorivoNative", isDirectory: true)
        self.projectsURL = baseDirectory.appendingPathComponent("projects.json")
        self.presetsURL = baseDirectory.appendingPathComponent("presets.json")
        self.thumbnailsDirectory = baseDirectory.appendingPathComponent("thumbnails", isDirectory: true)
        self.exportsDirectory = baseDirectory.appendingPathComponent("exports", isDirectory: true)

        prepareDirectories()
        loadPersisted()
    }

    func reload() {
        loadPersisted()
    }

    func project(id: String) -> ProjectRecord? {
        projects.first(where: { $0.id == id })
    }

    func renameProject(_ id: String, name: String) {
        guard let index = projects.firstIndex(where: { $0.id == id }) else { return }
        projects[index].name = name
        projects[index].updatedAt = Date()
        persistProjects()
        sortProjects()
    }

    func duplicateProject(_ id: String) {
        guard let original = project(id: id) else { return }
        var duplicate = original
        duplicate.id = makeID(prefix: "project")
        duplicate.name = original.name.map { "\($0) (Copy)" } ?? "Untitled Project (Copy)"
        duplicate.createdAt = Date()
        duplicate.updatedAt = Date()
        projects.append(duplicate)
        persistProjects()
        sortProjects()
    }

    func deleteProjects(_ ids: [String]) {
        projects.removeAll { ids.contains($0.id) }
        persistProjects()
    }

    func upsertSingleEffectProject(
        existingProjectID: String?,
        sourceImagePath: String,
        sourceSize: PixelSize,
        thumbnail: UIImage?,
        effect: ProjectEffect?
    ) -> ProjectRecord {
        let thumbnailPath = thumbnail.flatMap(storeThumbnail) ?? sourceImagePath
        let id = existingProjectID ?? makeID(prefix: "project")
        let existing = existingProjectID.flatMap(project(id:))

        let record = ProjectRecord(
            id: id,
            name: existing?.name,
            sourceImagePath: sourceImagePath,
            sourceImageDimensions: sourceSize,
            thumbnailPath: thumbnailPath,
            effect: effect,
            mixStack: nil,
            elements: nil,
            createdAt: existing?.createdAt ?? Date(),
            updatedAt: Date()
        )

        upsert(record)
        return record
    }

    func upsertMixProject(
        existingProjectID: String?,
        sourceImagePath: String,
        sourceSize: PixelSize,
        thumbnail: UIImage?,
        mixStack: [EffectLayer]
    ) -> ProjectRecord {
        let thumbnailPath = thumbnail.flatMap(storeThumbnail) ?? sourceImagePath
        let id = existingProjectID ?? makeID(prefix: "project")
        let existing = existingProjectID.flatMap(project(id:))

        let record = ProjectRecord(
            id: id,
            name: existing?.name,
            sourceImagePath: sourceImagePath,
            sourceImageDimensions: sourceSize,
            thumbnailPath: thumbnailPath,
            effect: nil,
            mixStack: mixStack,
            elements: nil,
            createdAt: existing?.createdAt ?? Date(),
            updatedAt: Date()
        )

        upsert(record)
        return record
    }

    func importMigration(_ result: MigrationResult) {
        if !result.projects.isEmpty {
            projects = result.projects
            persistProjects()
        }

        if !result.presets.isEmpty {
            presets = result.presets
            persistPresets()
        }

        sortProjects()
    }

    func clearCache() {
        do {
            let thumbnailContents = try fileManager.contentsOfDirectory(at: thumbnailsDirectory, includingPropertiesForKeys: nil)
            for url in thumbnailContents {
                try? fileManager.removeItem(at: url)
            }

            let exportContents = try fileManager.contentsOfDirectory(at: exportsDirectory, includingPropertiesForKeys: nil)
            for url in exportContents {
                try? fileManager.removeItem(at: url)
            }
        } catch {
            return
        }
    }

    func clearAllProjects() {
        projects = []
        persistProjects()
    }

    func exportRenderedImage(_ image: UIImage, format: ExportFormat, quality: Double) -> URL? {
        let filename = "export_\(Int(Date().timeIntervalSince1970)).\(format.rawValue)"
        let destination = exportsDirectory.appendingPathComponent(filename)
        let data: Data?

        switch format {
        case .png:
            data = image.pngData()
        case .jpg:
            data = image.jpegData(compressionQuality: max(0.1, min(1.0, quality / 100.0)))
        }

        guard let data else { return nil }
        do {
            try data.write(to: destination, options: .atomic)
            return destination
        } catch {
            return nil
        }
    }

    private func prepareDirectories() {
        try? fileManager.createDirectory(at: baseDirectory, withIntermediateDirectories: true, attributes: nil)
        try? fileManager.createDirectory(at: thumbnailsDirectory, withIntermediateDirectories: true, attributes: nil)
        try? fileManager.createDirectory(at: exportsDirectory, withIntermediateDirectories: true, attributes: nil)
    }

    private func loadPersisted() {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        if
            let data = try? Data(contentsOf: projectsURL),
            let loaded = try? decoder.decode([ProjectRecord].self, from: data)
        {
            projects = loaded
        }

        if
            let data = try? Data(contentsOf: presetsURL),
            let loaded = try? decoder.decode([EffectPreset].self, from: data)
        {
            presets = loaded
        }

        sortProjects()
    }

    private func upsert(_ record: ProjectRecord) {
        if let index = projects.firstIndex(where: { $0.id == record.id }) {
            projects[index] = record
        } else {
            projects.append(record)
        }
        persistProjects()
        sortProjects()
    }

    private func sortProjects() {
        projects.sort { $0.updatedAt > $1.updatedAt }
    }

    private func persistProjects() {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        if let data = try? encoder.encode(projects) {
            try? data.write(to: projectsURL, options: .atomic)
        }
    }

    private func persistPresets() {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        if let data = try? encoder.encode(presets) {
            try? data.write(to: presetsURL, options: .atomic)
        }
    }

    private func storeThumbnail(_ image: UIImage) -> String? {
        let filename = "thumb_\(Int(Date().timeIntervalSince1970 * 1000)).jpg"
        let url = thumbnailsDirectory.appendingPathComponent(filename)
        guard let data = image.jpegData(compressionQuality: 0.85) else { return nil }
        do {
            try data.write(to: url, options: .atomic)
            return url.path
        } catch {
            return nil
        }
    }

    private func makeID(prefix: String) -> String {
        "\(prefix)_\(Int(Date().timeIntervalSince1970 * 1000))_\(UUID().uuidString.prefix(8))"
    }
}

struct MigrationCoordinator {
    private let migrationKey = "corivo.swift.migration.completed"
    private let fileManager: FileManager = .default
    private let interestingKeys = ["app-storage", "effects-store", "corivo_project_ids"]

    func performIfNeeded(defaultLanguage: String) -> MigrationResult? {
        let defaults = UserDefaults.standard
        guard !defaults.bool(forKey: migrationKey) else { return nil }

        let result = migrate(defaultLanguage: defaultLanguage, legacyValues: scanForLegacyValues())
        defaults.set(true, forKey: migrationKey)
        return result
    }

    func migrate(defaultLanguage: String, legacyValues: [String: String]) -> MigrationResult? {
        var keyValues = legacyValues
        guard !keyValues.isEmpty else { return nil }
        var result = MigrationResult(hasSeenOnboarding: nil, preferences: nil, presets: [], projects: [])

        if let raw = keyValues["app-storage"], let payload = parseJSON(raw) as? [String: Any], let state = payload["state"] as? [String: Any] {
            result.hasSeenOnboarding = state["hasSeenOnboarding"] as? Bool
            if let legacyPreferences = state["preferences"] as? [String: Any] {
                result.preferences = mapPreferences(legacyPreferences, fallbackLanguage: defaultLanguage)
            }
        }

        if let raw = keyValues["effects-store"], let payload = parseJSON(raw) as? [String: Any], let state = payload["state"] as? [String: Any], let presets = state["presets"] as? [[String: Any]] {
            result.presets = presets.compactMap(mapPreset)
        }

        if let raw = keyValues["corivo_project_ids"], let ids = parseJSON(raw) as? [String] {
            for id in ids {
                let key = "corivo_project_\(id)"
                if keyValues[key] == nil {
                    keyValues[key] = discoverProjectValue(for: key)
                }
                if let rawProject = keyValues[key], let payload = parseJSON(rawProject) as? [String: Any], let project = mapProject(payload) {
                    result.projects.append(project)
                }
            }
        }

        return result
    }

    private func mapPreferences(_ dictionary: [String: Any], fallbackLanguage: String) -> UserPreferences {
        let exportFormat = (dictionary["defaultExportFormat"] as? String).flatMap(ExportFormat.init(rawValue:)) ?? .png
        let quality = (dictionary["defaultExportQuality"] as? NSNumber)?.doubleValue ?? 100
        let autoSave = dictionary["autoSaveProjects"] as? Bool ?? true
        let hapticFeedback = dictionary["hapticFeedback"] as? Bool ?? true
        let colorScheme = (dictionary["colorScheme"] as? String).flatMap(ColorSchemePreference.init(rawValue:)) ?? .auto
        let theme = (dictionary["theme"] as? String).flatMap(ThemeType.init(rawValue:)) ?? .dark
        let soundEnabled = dictionary["soundEnabled"] as? Bool ?? true
        let confirmDelete = dictionary["confirmDelete"] as? Bool ?? true
        let language = dictionary["language"] as? String ?? fallbackLanguage

        return UserPreferences(
            defaultExportFormat: exportFormat,
            defaultExportQuality: quality,
            autoSaveProjects: autoSave,
            hapticFeedback: hapticFeedback,
            colorScheme: colorScheme,
            theme: theme,
            soundEnabled: soundEnabled,
            confirmDelete: confirmDelete,
            language: language
        )
    }

    private func mapPreset(_ dictionary: [String: Any]) -> EffectPreset? {
        guard
            let id = dictionary["id"] as? String,
            let name = dictionary["name"] as? String,
            let effectID = dictionary["effectId"] as? String
        else {
            return nil
        }

        let params = (dictionary["params"] as? [String: Any] ?? [:]).compactMapValues(EffectValue.fromAny)
        let thumbnail = dictionary["thumbnail"] as? String
        let createdAt = (dictionary["createdAt"] as? NSNumber)?.doubleValue ?? Date().timeIntervalSince1970

        return EffectPreset(id: id, name: name, effectId: effectID, params: params, thumbnail: thumbnail, createdAt: createdAt)
    }

    private func mapProject(_ dictionary: [String: Any]) -> ProjectRecord? {
        guard
            let id = dictionary["id"] as? String,
            let sourceImagePath = dictionary["sourceImagePath"] as? String,
            let dimensions = dictionary["sourceImageDimensions"] as? [String: Any]
        else {
            return nil
        }

        let thumbnailPath = (dictionary["thumbnailPath"] as? String).flatMap { isValidPath($0) ? $0 : nil } ?? sourceImagePath
        let width = (dimensions["width"] as? NSNumber)?.doubleValue ?? 0
        let height = (dimensions["height"] as? NSNumber)?.doubleValue ?? 0
        let effect = mapProjectEffect(dictionary["effect"] as? [String: Any])
        let mixStack = (dictionary["mixStack"] as? [[String: Any]])?.compactMap(mapLayer)
        let createdAt = parseDate(dictionary["createdAt"]) ?? Date()
        let updatedAt = parseDate(dictionary["updatedAt"]) ?? Date()

        return ProjectRecord(
            id: id,
            name: dictionary["name"] as? String,
            sourceImagePath: sourceImagePath,
            sourceImageDimensions: PixelSize(width: width, height: height),
            thumbnailPath: thumbnailPath,
            effect: effect,
            mixStack: mixStack,
            elements: nil,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }

    private func mapProjectEffect(_ dictionary: [String: Any]?) -> ProjectEffect? {
        guard let dictionary, let effectID = dictionary["effectId"] as? String else { return nil }
        let params = (dictionary["params"] as? [String: Any] ?? [:]).compactMapValues(EffectValue.fromAny)
        return ProjectEffect(effectId: effectID, params: params)
    }

    private func mapLayer(_ dictionary: [String: Any]) -> EffectLayer? {
        guard
            let id = dictionary["id"] as? String,
            let effectID = dictionary["effectId"] as? String
        else {
            return nil
        }

        return EffectLayer(
            id: id,
            effectId: effectID,
            params: (dictionary["params"] as? [String: Any] ?? [:]).compactMapValues(EffectValue.fromAny),
            opacity: (dictionary["opacity"] as? NSNumber)?.doubleValue ?? 1,
            visible: dictionary["visible"] as? Bool ?? true,
            blendMode: BlendModeType(rawValue: dictionary["blendMode"] as? String ?? "normal") ?? .normal
        )
    }

    private func parseDate(_ value: Any?) -> Date? {
        if let string = value as? String {
            let formatter = ISO8601DateFormatter()
            return formatter.date(from: string)
        }
        if let number = value as? NSNumber {
            return Date(timeIntervalSince1970: number.doubleValue / (number.doubleValue > 10_000_000_000 ? 1000 : 1))
        }
        return nil
    }

    private func discoverProjectValue(for key: String) -> String? {
        let root = NSHomeDirectory()
        let enumerator = fileManager.enumerator(atPath: root)

        while let path = enumerator?.nextObject() as? String {
            let url = URL(fileURLWithPath: root).appendingPathComponent(path)
            guard let attributes = try? fileManager.attributesOfItem(atPath: url.path),
                  let size = attributes[.size] as? NSNumber,
                  size.intValue < 2_000_000
            else { continue }

            guard let data = try? Data(contentsOf: url) else { continue }
            let text = String(decoding: data, as: UTF8.self)
            if let extracted = extractEmbeddedJSON(key: key, from: text) {
                return extracted
            }
        }

        return nil
    }

    private func scanForLegacyValues() -> [String: String] {
        var values: [String: String] = [:]
        let root = NSHomeDirectory()
        let enumerator = fileManager.enumerator(atPath: root)

        while let relative = enumerator?.nextObject() as? String {
            let url = URL(fileURLWithPath: root).appendingPathComponent(relative)
            guard let attributes = try? fileManager.attributesOfItem(atPath: url.path),
                  let type = attributes[.type] as? FileAttributeType,
                  type == .typeRegular
            else { continue }

            guard let size = attributes[.size] as? NSNumber, size.intValue < 2_000_000 else { continue }
            guard let data = try? Data(contentsOf: url) else { continue }
            let text = String(decoding: data, as: UTF8.self)

            if url.lastPathComponent == "manifest.json", let manifest = parseJSON(text) as? [String: Any] {
                for (key, value) in manifest {
                    if let string = value as? String {
                        values[key] = string
                    }
                }
            }

            for key in interestingKeys where values[key] == nil {
                if let embedded = extractEmbeddedJSON(key: key, from: text) {
                    values[key] = embedded
                }
            }
        }

        return values
    }

    private func extractEmbeddedJSON(key: String, from text: String) -> String? {
        guard let keyRange = text.range(of: key) else { return nil }
        let suffix = text[keyRange.upperBound...]
        guard let startOffset = suffix.firstIndex(where: { $0 == "{" || $0 == "[" }) else { return nil }
        let opening = suffix[startOffset]
        let closing: Character = opening == "{" ? "}" : "]"

        var depth = 0
        var endIndex: String.Index?

        for index in suffix.indices where index >= startOffset {
            let character = suffix[index]
            if character == opening {
                depth += 1
            } else if character == closing {
                depth -= 1
                if depth == 0 {
                    endIndex = suffix.index(after: index)
                    break
                }
            }
        }

        guard let endIndex else { return nil }
        return String(suffix[startOffset..<endIndex])
    }

    private func parseJSON(_ raw: String) -> Any? {
        guard let data = raw.data(using: .utf8) else { return nil }
        return try? JSONSerialization.jsonObject(with: data, options: [.allowFragments])
    }

    private func isValidPath(_ path: String) -> Bool {
        if path.hasPrefix("asset://") || path.hasPrefix("ph://") {
            return true
        }

        if path.hasPrefix("file://"), let url = URL(string: path) {
            return fileManager.fileExists(atPath: url.path)
        }

        return fileManager.fileExists(atPath: path)
    }
}

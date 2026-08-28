import CoreGraphics
import Foundation

enum ExportFormat: String, CaseIterable, Codable {
    case png
    case jpg
}

enum ColorSchemePreference: String, CaseIterable, Codable {
    case auto
    case light
    case dark
}

enum ThemeType: String, CaseIterable, Codable, Identifiable {
    case light
    case dark
    case solar
    case mono

    var id: String { rawValue }
}

enum BlendModeType: String, CaseIterable, Codable {
    case normal
    case multiply
    case screen
    case overlay
    case softLight
}

enum EffectCategory: String, CaseIterable, Codable, Identifiable {
    case cellular
    case tiling
    case distortion
    case relief
    case glitch
    case stylization
    case blurSharpen = "blur-sharpen"
    case brush
    case glass
    case correction
    case frequency
    case render

    var id: String { rawValue }
}

enum EffectParameterKind: String, Codable {
    case slider
    case segmented
    case color
    case toggle
    case twoDPad = "2d-pad"
}

struct PixelSize: Codable, Hashable {
    var width: Double
    var height: Double
}

enum EffectValue: Codable, Hashable {
    case number(Double)
    case text(String)
    case bool(Bool)
    case vector([Double])

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let bool = try? container.decode(Bool.self) {
            self = .bool(bool)
        } else if let number = try? container.decode(Double.self) {
            self = .number(number)
        } else if let text = try? container.decode(String.self) {
            self = .text(text)
        } else if let vector = try? container.decode([Double].self) {
            self = .vector(vector)
        } else {
            throw DecodingError.typeMismatch(
                EffectValue.self,
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unsupported effect value"
                )
            )
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case let .number(value):
            try container.encode(value)
        case let .text(value):
            try container.encode(value)
        case let .bool(value):
            try container.encode(value)
        case let .vector(value):
            try container.encode(value)
        }
    }

    var numberValue: Double? {
        if case let .number(value) = self {
            return value
        }
        return nil
    }

    var stringValue: String? {
        if case let .text(value) = self {
            return value
        }
        return nil
    }

    var boolValue: Bool? {
        if case let .bool(value) = self {
            return value
        }
        return nil
    }

    var vectorValue: [Double]? {
        if case let .vector(value) = self {
            return value
        }
        return nil
    }

    static func fromAny(_ value: Any) -> EffectValue? {
        switch value {
        case let number as Double:
            return .number(number)
        case let number as Int:
            return .number(Double(number))
        case let number as NSNumber:
            return .number(number.doubleValue)
        case let text as String:
            return .text(text)
        case let bool as Bool:
            return .bool(bool)
        case let array as [Double]:
            return .vector(array)
        case let array as [NSNumber]:
            return .vector(array.map(\.doubleValue))
        case let array as [Any]:
            let numbers = array.compactMap { ($0 as? NSNumber)?.doubleValue ?? ($0 as? Double) }
            return numbers.count == array.count ? .vector(numbers) : nil
        default:
            return nil
        }
    }
}

struct UserPreferences: Codable, Hashable {
    var defaultExportFormat: ExportFormat
    var defaultExportQuality: Double
    var autoSaveProjects: Bool
    var hapticFeedback: Bool
    var colorScheme: ColorSchemePreference
    var theme: ThemeType
    var soundEnabled: Bool
    var confirmDelete: Bool
    var language: String

    static func defaultValue(deviceLanguage: String) -> UserPreferences {
        UserPreferences(
            defaultExportFormat: .png,
            defaultExportQuality: 100,
            autoSaveProjects: true,
            hapticFeedback: true,
            colorScheme: .auto,
            theme: .dark,
            soundEnabled: true,
            confirmDelete: true,
            language: deviceLanguage
        )
    }
}

struct ProjectEffect: Codable, Hashable {
    var effectId: String
    var params: [String: EffectValue]
}

struct EffectLayer: Codable, Hashable, Identifiable {
    var id: String
    var effectId: String
    var params: [String: EffectValue]
    var opacity: Double
    var visible: Bool
    var blendMode: BlendModeType
}

struct EffectPreset: Codable, Hashable, Identifiable {
    var id: String
    var name: String
    var effectId: String
    var params: [String: EffectValue]
    var thumbnail: String?
    var createdAt: TimeInterval
}

struct ProjectRecord: Codable, Hashable, Identifiable {
    var id: String
    var name: String?
    var sourceImagePath: String
    var sourceImageDimensions: PixelSize
    var thumbnailPath: String
    var effect: ProjectEffect?
    var mixStack: [EffectLayer]?
    var elements: [String]?
    var createdAt: Date
    var updatedAt: Date

    var elementCount: Int {
        if let mixStack, !mixStack.isEmpty {
            return mixStack.count
        }
        if let elements, !elements.isEmpty {
            return elements.count
        }
        return effect == nil ? 0 : 1
    }
}

struct EffectParameterDefinition: Codable, Hashable {
    var name: String
    var label: String
    var type: EffectParameterKind
    var min: Double?
    var max: Double?
    var defaultValue: EffectValue
    var options: [String]?
    var step: Double?

    enum CodingKeys: String, CodingKey {
        case name
        case label
        case type
        case min
        case max
        case defaultValue = "default"
        case options
        case step
    }
}

struct EffectDefinition: Codable, Hashable, Identifiable {
    var id: String
    var name: String
    var category: EffectCategory
    var description: String
    var isPremium: Bool
    var complexity: Double
    var iconPath: String?
    var parameters: [EffectParameterDefinition]
    var shaderPath: String?
}

struct EffectCatalog: Codable {
    var effects: [EffectDefinition]
}

enum HomeSheet: Identifiable {
    case recents
    case mixes(projectID: String? = nil, sourceImagePath: String? = nil)
    case settings
    case about
    case imagePicker(onSelect: (String, PixelSize) -> Void)

    var id: String {
        switch self {
        case .recents:
            return "recents"
        case let .mixes(projectID, sourceImagePath):
            return "mixes-\(projectID ?? sourceImagePath ?? UUID().uuidString)"
        case .settings:
            return "settings"
        case .about:
            return "about"
        case .imagePicker:
            return "imagePicker"
        }
    }
}

struct EditorSession: Identifiable, Equatable {
    var id = UUID()
    var projectID: String?
    var sourceImagePath: String
    var sourceSize: PixelSize?
}

struct ExportSession: Identifiable, Equatable {
    var id = UUID()
    var imagePath: String
    var renderedImageData: Data
    var format: ExportFormat
}

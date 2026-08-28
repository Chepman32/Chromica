import Foundation

enum TranslationNode: Decodable {
    case string(String)
    case object([String: TranslationNode])

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) {
            self = .string(string)
        } else if let object = try? container.decode([String: TranslationNode].self) {
            self = .object(object)
        } else {
            throw DecodingError.typeMismatch(
                TranslationNode.self,
                DecodingError.Context(
                    codingPath: decoder.codingPath,
                    debugDescription: "Unsupported translation node"
                )
            )
        }
    }
}

struct TranslationCatalog: Decodable {
    let languageNames: [String: String]
    let translations: [String: [String: TranslationNode]]
}

final class LocalizationManager {
    private(set) var catalog: TranslationCatalog

    init(bundle: Bundle = .main) {
        guard
            let url = bundle.url(forResource: "translations", withExtension: "json", subdirectory: "Generated"),
            let data = try? Data(contentsOf: url),
            let catalog = try? JSONDecoder().decode(TranslationCatalog.self, from: data)
        else {
            self.catalog = TranslationCatalog(languageNames: ["en": "English"], translations: [:])
            return
        }
        self.catalog = catalog
    }

    func text(_ keyPath: String, language: String, fallback: String = "") -> String {
        guard let root = catalog.translations[language] ?? catalog.translations["en"] else {
            return fallback
        }

        let parts = keyPath.split(separator: ".").map(String.init)
        var current: TranslationNode? = .object(root)

        for part in parts {
            guard case let .object(dictionary) = current else {
                return fallback
            }
            current = dictionary[part]
        }

        if case let .string(value) = current {
            return value
        }

        return fallback
    }

    func languageName(for code: String) -> String {
        catalog.languageNames[code] ?? code.uppercased()
    }

    var supportedLanguages: [String] {
        catalog.languageNames.keys.sorted()
    }
}

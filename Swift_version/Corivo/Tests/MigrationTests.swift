import XCTest
@testable import Corivo

final class MigrationTests: XCTestCase {
    func testEffectValueDecodesSimpleJSONTypes() throws {
        let decoder = JSONDecoder()
        XCTAssertEqual(try decoder.decode(EffectValue.self, from: Data("10".utf8)), .number(10))
        XCTAssertEqual(try decoder.decode(EffectValue.self, from: Data("\"Wave\"".utf8)), .text("Wave"))
        XCTAssertEqual(try decoder.decode(EffectValue.self, from: Data("true".utf8)), .bool(true))
    }

    func testMigrationImportsPreferencesPresetsAndProjects() throws {
        let appStorage = """
        {
          "state": {
            "hasSeenOnboarding": true,
            "preferences": {
              "defaultExportFormat": "jpg",
              "defaultExportQuality": 92,
              "autoSaveProjects": false,
              "hapticFeedback": false,
              "colorScheme": "light",
              "theme": "solar",
              "soundEnabled": false,
              "confirmDelete": false,
              "language": "es"
            }
          }
        }
        """

        let effectsStore = """
        {
          "state": {
            "presets": [
              {
                "id": "preset-1",
                "name": "Legacy Pixel",
                "effectId": "pixelate",
                "params": { "cellSize": 18, "mode": "square" },
                "thumbnail": "asset://preset-thumb",
                "createdAt": 1710000000
              }
            ]
          }
        }
        """

        let project = """
        {
          "id": "project-1",
          "name": "Legacy Project",
          "sourceImagePath": "asset://legacy-source",
          "sourceImageDimensions": { "width": 1200, "height": 900 },
          "thumbnailPath": "/missing/thumb.jpg",
          "effect": {
            "effectId": "pixelate",
            "params": { "cellSize": 12, "shape": "square" }
          },
          "createdAt": "2025-01-02T03:04:05Z",
          "updatedAt": 1710000000000
        }
        """

        let result = MigrationCoordinator().migrate(
            defaultLanguage: "en",
            legacyValues: [
                "app-storage": appStorage,
                "effects-store": effectsStore,
                "corivo_project_ids": "[\"project-1\"]",
                "corivo_project_project-1": project,
            ]
        )

        XCTAssertNotNil(result)
        XCTAssertEqual(result?.hasSeenOnboarding, true)
        XCTAssertEqual(result?.preferences?.defaultExportFormat, .jpg)
        XCTAssertEqual(result?.preferences?.defaultExportQuality, 92)
        XCTAssertEqual(result?.preferences?.theme, .solar)
        XCTAssertEqual(result?.preferences?.language, "es")
        XCTAssertEqual(result?.presets.count, 1)
        XCTAssertEqual(result?.presets.first?.effectId, "pixelate")
        XCTAssertEqual(result?.presets.first?.params["cellSize"], .number(18))
        XCTAssertEqual(result?.projects.count, 1)
        XCTAssertEqual(result?.projects.first?.id, "project-1")
        XCTAssertEqual(result?.projects.first?.thumbnailPath, "asset://legacy-source")
        XCTAssertEqual(result?.projects.first?.effect?.params["cellSize"], .number(12))
    }
}

import XCTest
import UIKit
@testable import Corivo

@MainActor
final class PersistenceTests: XCTestCase {
    func testProjectElementCountUsesMixStackFirst() {
        let project = ProjectRecord(
            id: "p1",
            name: nil,
            sourceImagePath: "/tmp/source.png",
            sourceImageDimensions: PixelSize(width: 100, height: 100),
            thumbnailPath: "/tmp/thumb.jpg",
            effect: ProjectEffect(effectId: "pixelate", params: [:]),
            mixStack: [
                EffectLayer(id: "l1", effectId: "pixelate", params: [:], opacity: 1, visible: true, blendMode: .normal),
                EffectLayer(id: "l2", effectId: "wave", params: [:], opacity: 1, visible: true, blendMode: .normal),
            ],
            elements: ["legacy"],
            createdAt: Date(),
            updatedAt: Date()
        )

        XCTAssertEqual(project.elementCount, 2)
    }

    func testProjectStorePersistsAndReloadsProjects() {
        let directory = makeTemporaryStoreDirectory()
        let store = ProjectStore(baseDirectoryOverride: directory)

        let created = store.upsertSingleEffectProject(
            existingProjectID: nil,
            sourceImagePath: "asset://source-image",
            sourceSize: PixelSize(width: 640, height: 480),
            thumbnail: nil,
            effect: ProjectEffect(effectId: "pixelate", params: ["cellSize": .number(14)])
        )

        store.renameProject(created.id, name: "Posterized")

        let reloaded = ProjectStore(baseDirectoryOverride: directory)
        XCTAssertEqual(reloaded.projects.count, 1)
        XCTAssertEqual(reloaded.projects.first?.id, created.id)
        XCTAssertEqual(reloaded.projects.first?.name, "Posterized")
        XCTAssertEqual(reloaded.projects.first?.effect?.effectId, "pixelate")
        XCTAssertEqual(reloaded.projects.first?.effect?.params["cellSize"], .number(14))
    }

    func testProjectStoreCanDuplicateDeleteAndExport() {
        let directory = makeTemporaryStoreDirectory()
        let store = ProjectStore(baseDirectoryOverride: directory)

        let created = store.upsertSingleEffectProject(
            existingProjectID: nil,
            sourceImagePath: "asset://source-image",
            sourceSize: PixelSize(width: 1200, height: 800),
            thumbnail: nil,
            effect: ProjectEffect(effectId: "wave", params: [:])
        )

        store.duplicateProject(created.id)
        XCTAssertEqual(store.projects.count, 2)

        let image = UIGraphicsImageRenderer(size: CGSize(width: 8, height: 8)).image { context in
            UIColor.red.setFill()
            context.fill(CGRect(x: 0, y: 0, width: 8, height: 8))
        }

        let exported = store.exportRenderedImage(image, format: .png, quality: 100)
        XCTAssertNotNil(exported)
        XCTAssertTrue(FileManager.default.fileExists(atPath: exported?.path ?? ""))

        let ids = store.projects.map(\.id)
        store.deleteProjects(ids)
        XCTAssertTrue(store.projects.isEmpty)
    }

    private func makeTemporaryStoreDirectory() -> URL {
        let directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("corivo-tests-\(UUID().uuidString)", isDirectory: true)
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true, attributes: nil)
        addTeardownBlock {
            try? FileManager.default.removeItem(at: directory)
        }
        return directory
    }
}

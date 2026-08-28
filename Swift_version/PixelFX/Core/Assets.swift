import Photos
import SwiftUI
import UIKit

enum PixelFXAssets {
    private static let folder = "Assets"

    static func imagePath(_ relativePath: String) -> URL? {
        Bundle.main.url(forResource: relativePath, withExtension: nil, subdirectory: folder)
    }

    static func uiImage(_ relativePath: String) -> UIImage? {
        guard let url = imagePath(relativePath) else { return nil }
        return UIImage(contentsOfFile: url.path)
    }

    static func image(_ relativePath: String) -> Image? {
        guard let uiImage = uiImage(relativePath) else { return nil }
        return Image(uiImage: uiImage)
    }

    static func resolveImage(sourcePath: String, completion: @escaping (UIImage?) -> Void) {
        if sourcePath.hasPrefix("file://"), let url = URL(string: sourcePath) {
            completion(UIImage(contentsOfFile: url.path))
            return
        }

        if sourcePath.hasPrefix("/") {
            completion(UIImage(contentsOfFile: sourcePath))
            return
        }

        if sourcePath.hasPrefix("asset://") {
            requestPhotoAsset(localIdentifier: sourcePath.replacingOccurrences(of: "asset://", with: ""), completion: completion)
            return
        }

        if sourcePath.hasPrefix("ph://") {
            requestPhotoAsset(localIdentifier: sourcePath.replacingOccurrences(of: "ph://", with: ""), completion: completion)
            return
        }

        completion(nil)
    }

    static func requestThumbnail(localIdentifier: String, targetSize: CGSize, completion: @escaping (UIImage?) -> Void) {
        requestPhotoAsset(
            localIdentifier: localIdentifier,
            targetSize: targetSize,
            contentMode: .aspectFill,
            deliveryMode: .opportunistic,
            completion: completion
        )
    }

    static func resolveImageSynchronously(sourcePath: String) -> UIImage? {
        if sourcePath.hasPrefix("file://"), let url = URL(string: sourcePath) {
            return UIImage(contentsOfFile: url.path)
        }

        if sourcePath.hasPrefix("/") {
            return UIImage(contentsOfFile: sourcePath)
        }

        if sourcePath.hasPrefix("asset://") || sourcePath.hasPrefix("ph://") {
            let identifier = sourcePath
                .replacingOccurrences(of: "asset://", with: "")
                .replacingOccurrences(of: "ph://", with: "")

            let semaphore = DispatchSemaphore(value: 0)
            var image: UIImage?
            requestPhotoAsset(localIdentifier: identifier) { loaded in
                image = loaded
                semaphore.signal()
            }
            _ = semaphore.wait(timeout: .now() + 2)
            return image
        }

        return nil
    }

    private static func requestPhotoAsset(localIdentifier: String, completion: @escaping (UIImage?) -> Void) {
        requestPhotoAsset(
            localIdentifier: localIdentifier,
            targetSize: PHImageManagerMaximumSize,
            contentMode: .aspectFit,
            deliveryMode: .highQualityFormat,
            completion: completion
        )
    }

    private static func requestPhotoAsset(
        localIdentifier: String,
        targetSize: CGSize,
        contentMode: PHImageContentMode,
        deliveryMode: PHImageRequestOptionsDeliveryMode,
        completion: @escaping (UIImage?) -> Void
    ) {
        let result = PHAsset.fetchAssets(withLocalIdentifiers: [localIdentifier], options: nil)
        guard let asset = result.firstObject else {
            completion(nil)
            return
        }

        let options = PHImageRequestOptions()
        options.deliveryMode = deliveryMode
        options.isSynchronous = false
        options.resizeMode = .fast
        options.isNetworkAccessAllowed = true

        PHImageManager.default().requestImage(
            for: asset,
            targetSize: targetSize,
            contentMode: contentMode,
            options: options
        ) { image, _ in
            completion(image)
        }
    }
}

struct AssetIconView: View {
    let path: String?
    let size: CGFloat

    var body: some View {
        Group {
            if let path, let image = PixelFXAssets.image(path) {
                image
                    .resizable()
                    .scaledToFill()
            } else {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.white.opacity(0.08))
                    .overlay(
                        Text("FX")
                            .font(.caption.weight(.semibold))
                            .foregroundColor(.white.opacity(0.5))
                    )
            }
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}

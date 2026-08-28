import Photos
import SwiftUI
import UIKit

struct RadialAction: Identifiable {
    let id: String
    let label: String
    let iconPath: String
    let action: () -> Void
}

struct LiquidRadialMenuView: View {
    let theme: PixelFXTheme
    let centerIconPath: String
    let centerLabel: String
    let actions: [RadialAction]
    let onCenterTap: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var appear = false
    @State private var pulse = false

    private let parentRadius: CGFloat = 48
    private let childRadius: CGFloat = 44
    private let orbitalDistance: CGFloat = 120

    var body: some View {
        GeometryReader { proxy in
            let center = CGPoint(x: proxy.size.width / 2, y: proxy.size.height / 2 - 32)

            ZStack {
                ForEach(Array(actions.enumerated()), id: \.element.id) { index, action in
                    let point = satellitePoint(index: index, count: actions.count, center: center)
                    circleGlow(color: theme.backgrounds.tertiary, radius: childRadius)
                        .frame(width: childRadius * 2, height: childRadius * 2)
                        .position(point)
                        .opacity(appear ? 0.95 : 0)
                        .blur(radius: 8)

                    Button(action: action.action) {
                        VStack(spacing: 8) {
                            AssetIconView(path: action.iconPath, size: childRadius * 1.75)
                                .frame(width: childRadius * 2, height: childRadius * 2)
                                .background(theme.backgrounds.tertiary)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(theme.overlays.light, lineWidth: 2))
                            Text(action.label)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(theme.text.secondary)
                        }
                    }
                    .buttonStyle(.plain)
                    .position(point)
                    .opacity(appear ? 1 : 0)
                    .scaleEffect(appear ? 1 : 0.3)
                    .animation(animation.delay(Double(index) * 0.08), value: appear)
                }

                circleGlow(color: theme.accent.primary, radius: parentRadius)
                    .frame(width: parentRadius * 2.2, height: parentRadius * 2.2)
                    .position(center)
                    .scaleEffect(pulse ? 1.05 : 1)
                    .blur(radius: 18)

                Button(action: onCenterTap) {
                    AssetIconView(path: centerIconPath, size: parentRadius)
                        .frame(width: parentRadius * 2, height: parentRadius * 2)
                        .background(theme.accent.primary)
                        .clipShape(Circle())
                        .shadow(color: theme.accent.primary.opacity(0.55), radius: 18, y: 10)
                }
                .buttonStyle(.plain)
                .position(center)
                .scaleEffect(pulse ? 1.04 : 1)
                .accessibilityLabel(centerLabel)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .onAppear {
                withAnimation(animation.delay(reduceMotion ? 0 : 0.5)) {
                    appear = true
                }
                guard !reduceMotion else { return }
                withAnimation(.easeInOut(duration: 1.6).repeatForever(autoreverses: true)) {
                    pulse = true
                }
            }
        }
    }

    private var animation: Animation {
        reduceMotion ? .linear(duration: 0) : .spring(response: 0.55, dampingFraction: 0.72)
    }

    private func satellitePoint(index: Int, count: Int, center: CGPoint) -> CGPoint {
        let step = (2 * Double.pi) / Double(max(count, 1))
        let angle = -Double.pi / 2 + Double(index) * step
        let distance = appear ? orbitalDistance : 0
        return CGPoint(
            x: center.x + CGFloat(cos(angle)) * distance,
            y: center.y + CGFloat(sin(angle)) * distance
        )
    }

    private func circleGlow(color: Color, radius: CGFloat) -> some View {
        Circle()
            .fill(color)
            .frame(width: radius * 2, height: radius * 2)
    }
}

struct ParameterSliderView: View {
    let label: String
    let value: Double
    let bounds: ClosedRange<Double>
    let step: Double
    let theme: PixelFXTheme
    let onEditingChanged: (Bool) -> Void
    let onChange: (Double) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: PixelFXDesign.spacingS) {
            HStack {
                Text(label)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(theme.text.secondary)
                Spacer()
                Text(displayValue)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(theme.text.primary)
            }

            Slider(
                value: Binding(
                    get: { value },
                    set: { onChange(round($0 / step) * step) }
                ),
                in: bounds,
                onEditingChanged: onEditingChanged
            )
            .tint(theme.accent.secondary)
        }
        .padding(.vertical, PixelFXDesign.spacingS)
    }

    private var displayValue: String {
        if step < 1 {
            return String(format: "%.1f", value)
        }
        return String(Int(value.rounded()))
    }
}

struct OptionChipsView: View {
    let label: String
    let options: [String]
    let selected: String
    let theme: PixelFXTheme
    let onSelect: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: PixelFXDesign.spacingS) {
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(theme.text.secondary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: PixelFXDesign.spacingXS) {
                    ForEach(options, id: \.self) { option in
                        Button(option) {
                            onSelect(option)
                        }
                        .buttonStyle(.plain)
                        .padding(.horizontal, PixelFXDesign.spacingM)
                        .padding(.vertical, 10)
                        .background(selected == option ? theme.accent.secondary : theme.backgrounds.tertiary)
                        .foregroundColor(selected == option ? theme.text.primary : theme.text.secondary)
                        .clipShape(RoundedRectangle(cornerRadius: PixelFXDesign.cornerMedium, style: .continuous))
                    }
                }
            }
        }
        .padding(.vertical, PixelFXDesign.spacingS)
    }
}

struct PointPadControl: View {
    let label: String
    let theme: PixelFXTheme
    let point: [Double]
    let onChange: ([Double]) -> Void

    @State private var dragPoint: CGPoint = CGPoint(x: 0.5, y: 0.5)

    var body: some View {
        VStack(alignment: .leading, spacing: PixelFXDesign.spacingS) {
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(theme.text.secondary)

            GeometryReader { proxy in
                pointPad(size: min(proxy.size.width, 180))
            }
            .frame(height: 190)
        }
        .onAppear(perform: syncDragPoint)
    }

    @ViewBuilder
    private func pointPad(size: CGFloat) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: PixelFXDesign.cornerLarge, style: .continuous)
                .fill(theme.backgrounds.tertiary)

            crosshairPath(size: size)
                .stroke(theme.overlays.light, style: StrokeStyle(lineWidth: 1, dash: [4, 6]))

            Circle()
                .fill(theme.accent.secondary)
                .frame(width: 26, height: 26)
                .position(knobPosition(size: size))
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { value in
                            updatePoint(for: value.location, size: size)
                        }
                )
        }
        .frame(width: size, height: size)
    }

    private func crosshairPath(size: CGFloat) -> Path {
        Path { path in
            path.move(to: CGPoint(x: size / 2, y: 0))
            path.addLine(to: CGPoint(x: size / 2, y: size))
            path.move(to: CGPoint(x: 0, y: size / 2))
            path.addLine(to: CGPoint(x: size, y: size / 2))
        }
    }

    private func knobPosition(size: CGFloat) -> CGPoint {
        CGPoint(
            x: size * dragPoint.x,
            y: size * dragPoint.y
        )
    }

    private func syncDragPoint() {
        let x = point.indices.contains(0) ? CGFloat(point[0]) : 0.5
        let y = point.indices.contains(1) ? CGFloat(point[1]) : 0.5
        dragPoint = CGPoint(x: x, y: y)
    }

    private func updatePoint(for location: CGPoint, size: CGFloat) {
        let x = min(max(location.x / size, 0), 1)
        let y = min(max(location.y / size, 0), 1)
        dragPoint = CGPoint(x: x, y: y)
        onChange([Double(x), Double(y)])
    }
}

struct ActivityView: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

struct AlertItem: Identifiable {
    let id = UUID()
    let title: String
    let message: String
}

struct PhotoAssetItem: Identifiable {
    let id: String
    let size: PixelSize
    let createdAt: Date?
}

@MainActor
final class PhotoLibraryViewModel: ObservableObject {
    @Published var authorizationStatus: PHAuthorizationStatus = PHPhotoLibrary.authorizationStatus(for: .readWrite)
    @Published var assets: [PhotoAssetItem] = []

    private let manager = PHCachingImageManager()

    func load() {
        let current = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        authorizationStatus = current
        if current == .authorized || current == .limited {
            fetchAssets()
            return
        }

        PHPhotoLibrary.requestAuthorization(for: .readWrite) { [weak self] status in
            Task { @MainActor in
                self?.authorizationStatus = status
                if status == .authorized || status == .limited {
                    self?.fetchAssets()
                }
            }
        }
    }

    func requestThumbnail(for id: String, targetSize: CGSize, completion: @escaping (UIImage?) -> Void) {
        let result = PHAsset.fetchAssets(withLocalIdentifiers: [id], options: nil)
        guard let asset = result.firstObject else {
            completion(nil)
            return
        }

        let options = PHImageRequestOptions()
        options.resizeMode = .fast
        options.deliveryMode = .opportunistic
        options.isNetworkAccessAllowed = true

        manager.requestImage(
            for: asset,
            targetSize: targetSize,
            contentMode: .aspectFill,
            options: options
        ) { image, _ in
            completion(image)
        }
    }

    private func fetchAssets() {
        let options = PHFetchOptions()
        options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        options.fetchLimit = 80

        let result = PHAsset.fetchAssets(with: .image, options: options)
        var items: [PhotoAssetItem] = []
        result.enumerateObjects { asset, _, _ in
            items.append(
                PhotoAssetItem(
                    id: asset.localIdentifier,
                    size: PixelSize(width: Double(asset.pixelWidth), height: Double(asset.pixelHeight)),
                    createdAt: asset.creationDate
                )
            )
        }
        assets = items
    }
}

struct PhotoGridPickerView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appModel: AppModel
    @StateObject private var viewModel = PhotoLibraryViewModel()

    let onSelect: (String, PixelSize) -> Void

    private let columns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 4)

    var body: some View {
        let theme = appModel.theme

        NavigationView {
            Group {
                if viewModel.authorizationStatus == .authorized || viewModel.authorizationStatus == .limited {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 4) {
                            ForEach(viewModel.assets) { asset in
                                PhotoThumbnailTile(asset: asset) {
                                    onSelect("asset://\(asset.id)", asset.size)
                                    dismiss()
                                }
                            }
                        }
                        .padding(4)
                    }
                } else {
                    VStack(spacing: PixelFXDesign.spacingL) {
                        Text("Allow access to your photos to keep the native image picker flow.")
                            .multilineTextAlignment(.center)
                            .foregroundColor(theme.text.secondary)
                        Button("Grant Access") {
                            viewModel.load()
                        }
                        .buttonStyle(.plain)
                        .padding(.horizontal, PixelFXDesign.spacingL)
                        .padding(.vertical, PixelFXDesign.spacingS)
                        .background(theme.accent.primary)
                        .foregroundColor(theme.backgrounds.primary)
                        .clipShape(RoundedRectangle(cornerRadius: PixelFXDesign.cornerMedium, style: .continuous))
                    }
                    .padding(PixelFXDesign.spacingL)
                }
            }
            .navigationTitle("Select Photo")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(appModel.text("common.close", fallback: "Close")) {
                        dismiss()
                    }
                }
            }
            .background(theme.backgrounds.primary.ignoresSafeArea())
        }
        .onAppear {
            viewModel.load()
        }
    }
}

struct PhotoThumbnailTile: View {
    @EnvironmentObject private var appModel: AppModel
    let asset: PhotoAssetItem
    let onTap: () -> Void

    @State private var image: UIImage?

    var body: some View {
        Button(action: onTap) {
            Group {
                if let image {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                } else {
                    Rectangle()
                        .fill(appModel.theme.backgrounds.tertiary)
                        .overlay(ProgressView().tint(appModel.theme.accent.secondary))
                }
            }
            .frame(height: 96)
            .clipped()
        }
        .buttonStyle(.plain)
        .task {
            guard image == nil else { return }
            let size = CGSize(width: 220, height: 220)
            await MainActor.run {
                PixelFXAssets.requestThumbnail(localIdentifier: asset.id, targetSize: size) { loaded in
                    image = loaded
                }
            }
        }
    }
}

func relativeTimestamp(from date: Date) -> String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .short
    return formatter.localizedString(for: date, relativeTo: Date())
}

import Photos
import SwiftUI
import UIKit

private struct EditorHistorySnapshot: Equatable {
    var effectID: String?
    var category: EffectCategory
    var params: [String: EffectValue]
}

struct EditorView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appModel: AppModel

    let session: EditorSession

    @State private var sourceImage: UIImage?
    @State private var previewImage: UIImage?
    @State private var currentProjectID: String?
    @State private var sourceSize: PixelSize = PixelSize(width: 0, height: 0)
    @State private var selectedCategory: EffectCategory = .cellular
    @State private var selectedEffectID: String?
    @State private var currentParams: [String: EffectValue] = [:]
    @State private var parameterCache: [String: [String: EffectValue]] = [:]
    @State private var history: [EditorHistorySnapshot] = [.init(effectID: nil, category: .cellular, params: [:])]
    @State private var historyIndex = 0
    @State private var previewScale: CGFloat = 1
    @State private var exportImage: UIImage?
    @State private var showExport = false

    var body: some View {
        let theme = appModel.theme
        let currentEffect = selectedEffectID.flatMap(appModel.effectRegistry.effect(id:))
        let categoryEffects = appModel.effectRegistry.effects(for: selectedCategory)

        NavigationView {
            VStack(spacing: 0) {
                topBar(theme: theme)

                ZStack {
                    theme.backgrounds.primary
                    if let previewImage {
                        Image(uiImage: previewImage)
                            .resizable()
                            .scaledToFit()
                            .scaleEffect(previewScale)
                            .gesture(
                                MagnificationGesture()
                                    .onChanged { previewScale = $0 }
                            )
                            .padding(.horizontal, CorivoDesign.screenPadding)
                            .padding(.vertical, CorivoDesign.spacingS)
                    } else {
                        Text(sourceImage == nil ? "Loading image..." : "Preparing preview...")
                            .foregroundColor(theme.text.secondary)
                    }
                }
                .frame(maxWidth: .infinity, minHeight: 280, maxHeight: 360)

                ScrollView {
                    VStack(alignment: .leading, spacing: CorivoDesign.spacingL) {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: CorivoDesign.spacingS) {
                                ForEach(appModel.effectRegistry.categories) { category in
                                    Button(appModel.categoryName(category)) {
                                        selectedCategory = category
                                        CorivoHaptics.selection(enabled: appModel.preferences.hapticFeedback)
                                    }
                                    .buttonStyle(.plain)
                                    .padding(.horizontal, CorivoDesign.spacingM)
                                    .padding(.vertical, 10)
                                    .background(selectedCategory == category ? theme.accent.secondary : theme.backgrounds.tertiary)
                                    .foregroundColor(selectedCategory == category ? theme.text.primary : theme.text.secondary)
                                    .clipShape(Capsule())
                                }
                            }
                        }

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: CorivoDesign.spacingS) {
                                ForEach(categoryEffects) { effect in
                                    Button {
                                        selectEffect(effect)
                                    } label: {
                                        VStack(spacing: CorivoDesign.spacingS) {
                                            AssetIconView(path: effect.iconPath, size: 92)
                                            Text(appModel.effectName(effect))
                                                .font(.system(size: 13, weight: .semibold))
                                                .foregroundColor(theme.text.primary)
                                                .multilineTextAlignment(.center)
                                        }
                                        .padding(CorivoDesign.spacingS)
                                        .frame(width: 126)
                                        .background(selectedEffectID == effect.id ? theme.backgrounds.tertiary : theme.backgrounds.secondary)
                                        .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerLarge, style: .continuous))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: CorivoDesign.cornerLarge, style: .continuous)
                                                .stroke(selectedEffectID == effect.id ? theme.accent.secondary : .clear, lineWidth: 2)
                                        )
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }

                        if let currentEffect, selectedEffectID != nil {
                            VStack(alignment: .leading, spacing: CorivoDesign.spacingS) {
                                HStack {
                                    Text(appModel.effectName(currentEffect))
                                        .font(.system(size: 18, weight: .bold))
                                        .foregroundColor(theme.text.primary)
                                    Spacer()
                                    Button("Reset") {
                                        resetToDefaults()
                                    }
                                    .buttonStyle(.plain)
                                    .padding(.horizontal, CorivoDesign.spacingS)
                                    .padding(.vertical, 6)
                                    .background(theme.backgrounds.tertiary)
                                    .foregroundColor(theme.accent.secondary)
                                    .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerMedium, style: .continuous))
                                }

                                ForEach(currentEffect.parameters, id: \.name) { parameter in
                                    switch parameter.type {
                                    case .slider:
                                        ParameterSliderView(
                                            label: appModel.parameterLabel(parameter),
                                            value: currentParams[parameter.name]?.numberValue ?? parameter.defaultValue.numberValue ?? 0,
                                            bounds: (parameter.min ?? 0)...(parameter.max ?? 1),
                                            step: parameter.step ?? 1,
                                            theme: theme,
                                            onEditingChanged: { editing in
                                                if !editing { commitHistory() }
                                            },
                                            onChange: { updateParameter(parameter.name, with: .number($0)) }
                                        )
                                    case .segmented, .color:
                                        OptionChipsView(
                                            label: appModel.parameterLabel(parameter),
                                            options: parameter.options ?? [],
                                            selected: currentParams[parameter.name]?.stringValue ?? parameter.defaultValue.stringValue ?? "",
                                            theme: theme,
                                            onSelect: {
                                                updateParameter(parameter.name, with: .text($0))
                                                commitHistory()
                                            }
                                        )
                                    case .twoDPad:
                                        PointPadControl(
                                            label: appModel.parameterLabel(parameter),
                                            theme: theme,
                                            point: currentParams[parameter.name]?.vectorValue ?? parameter.defaultValue.vectorValue ?? [0.5, 0.5],
                                            onChange: {
                                                updateParameter(parameter.name, with: .vector($0))
                                                commitHistory()
                                            }
                                        )
                                    case .toggle:
                                        EmptyView()
                                    }
                                }
                            }
                        }
                    }
                    .padding(CorivoDesign.screenPadding)
                }
                .background(theme.backgrounds.primary)
            }
            .background(theme.backgrounds.primary.ignoresSafeArea())
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showExport) {
            if let exportImage {
                ExportView(image: exportImage)
                    .environmentObject(appModel)
            }
        }
        .task {
            await loadSession()
        }
    }

    private func topBar(theme: CorivoTheme) -> some View {
        HStack {
            Button {
                saveCurrentProject()
                dismiss()
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 22, weight: .medium))
                    .foregroundColor(theme.text.primary)
            }

            Spacer()

            HStack(spacing: 24) {
                Button {
                    guard historyIndex > 0 else { return }
                    historyIndex -= 1
                    apply(history[historyIndex], render: true)
                    CorivoHaptics.impact(.light, enabled: appModel.preferences.hapticFeedback)
                } label: {
                    Image(systemName: "arrow.uturn.backward")
                        .foregroundColor(historyIndex > 0 ? theme.text.primary : theme.text.tertiary)
                }

                Button {
                    guard historyIndex < history.count - 1 else { return }
                    historyIndex += 1
                    apply(history[historyIndex], render: true)
                    CorivoHaptics.impact(.light, enabled: appModel.preferences.hapticFeedback)
                } label: {
                    Image(systemName: "arrow.uturn.forward")
                        .foregroundColor(historyIndex < history.count - 1 ? theme.text.primary : theme.text.tertiary)
                }

                Button {
                    clearEffect()
                } label: {
                    Image(systemName: "arrow.counterclockwise")
                        .foregroundColor(theme.text.primary)
                }
            }
            .font(.system(size: 20, weight: .medium))

            Spacer()

            Button {
                saveCurrentProject()
                exportImage = fullResolutionRender()
                showExport = exportImage != nil
            } label: {
                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(theme.text.primary)
            }
        }
        .padding(.horizontal, CorivoDesign.screenPadding)
        .padding(.vertical, CorivoDesign.spacingS)
    }

    private func loadSession() async {
        currentProjectID = session.projectID
        if let projectID = session.projectID, let project = appModel.projectStore.project(id: projectID) {
            sourceSize = project.sourceImageDimensions
            if let effect = project.effect {
                selectedEffectID = effect.effectId
                currentParams = effect.params
                parameterCache[effect.effectId] = effect.params
                if let definition = appModel.effectRegistry.effect(id: effect.effectId) {
                    selectedCategory = definition.category
                }
                history = [.init(effectID: effect.effectId, category: selectedCategory, params: effect.params)]
            }
        } else if let size = session.sourceSize {
            sourceSize = size
        }

        CorivoAssets.resolveImage(sourcePath: session.sourceImagePath) { loaded in
            sourceImage = loaded
            if sourceSize.width == 0 || sourceSize.height == 0, let loaded {
                sourceSize = PixelSize(width: Double(loaded.size.width), height: Double(loaded.size.height))
            }
            renderPreview()
        }
    }

    private func selectEffect(_ effect: EffectDefinition) {
        selectedEffectID = effect.id
        selectedCategory = effect.category
        let parameters = parameterCache[effect.id] ?? appModel.effectRegistry.defaultParameters(for: effect.id)
        currentParams = parameters
        commitHistory()
        renderPreview()
        CorivoHaptics.impact(.medium, enabled: appModel.preferences.hapticFeedback)
    }

    private func updateParameter(_ name: String, with value: EffectValue) {
        guard let selectedEffectID else { return }
        currentParams[name] = value
        parameterCache[selectedEffectID] = currentParams
        renderPreview()
    }

    private func resetToDefaults() {
        guard let selectedEffectID else { return }
        currentParams = appModel.effectRegistry.defaultParameters(for: selectedEffectID)
        parameterCache[selectedEffectID] = currentParams
        commitHistory()
        renderPreview()
    }

    private func clearEffect() {
        selectedEffectID = nil
        currentParams = [:]
        commitHistory()
        renderPreview()
    }

    private func commitHistory() {
        let snapshot = EditorHistorySnapshot(effectID: selectedEffectID, category: selectedCategory, params: currentParams)
        if historyIndex < history.count - 1 {
            history = Array(history.prefix(historyIndex + 1))
        }
        if history.last != snapshot {
            history.append(snapshot)
            historyIndex = history.count - 1
        }
    }

    private func apply(_ snapshot: EditorHistorySnapshot, render: Bool) {
        selectedEffectID = snapshot.effectID
        selectedCategory = snapshot.category
        currentParams = snapshot.params
        if render { renderPreview() }
    }

    private func renderPreview() {
        guard let sourceImage else { return }
        let effect = selectedEffectID.map { ProjectEffect(effectId: $0, params: currentParams) }
        let targetSize = CGSize(width: UIScreen.main.bounds.width - 32, height: 320)
        let pipeline = appModel.renderPipeline
        DispatchQueue.global(qos: .userInitiated).async {
            let image = pipeline.renderPreview(image: sourceImage, effect: effect, targetSize: targetSize)
            DispatchQueue.main.async {
                previewImage = image
            }
        }
    }

    private func fullResolutionRender() -> UIImage? {
        guard let sourceImage else { return nil }
        let effect = selectedEffectID.map { ProjectEffect(effectId: $0, params: currentParams) }
        return appModel.renderPipeline.renderPreview(image: sourceImage, effect: effect, targetSize: nil)
    }

    private func saveCurrentProject() {
        guard let sourceImage else { return }
        let effect = selectedEffectID.map { ProjectEffect(effectId: $0, params: currentParams) }
        let thumbnail = previewImage ?? sourceImage
        let record = appModel.projectStore.upsertSingleEffectProject(
            existingProjectID: currentProjectID,
            sourceImagePath: session.sourceImagePath,
            sourceSize: sourceSize.width == 0 ? PixelSize(width: Double(sourceImage.size.width), height: Double(sourceImage.size.height)) : sourceSize,
            thumbnail: thumbnail,
            effect: effect
        )
        currentProjectID = record.id
    }
}

struct MixesView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appModel: AppModel

    let projectID: String?
    let sourceImagePath: String?

    @State private var currentProjectID: String?
    @State private var currentSourcePath: String?
    @State private var currentSourceSize: PixelSize = PixelSize(width: 0, height: 0)
    @State private var sourceImage: UIImage?
    @State private var previewImage: UIImage?
    @State private var selectedCategory: EffectCategory = .cellular
    @State private var mixStack: [EffectLayer] = []
    @State private var showPicker = false

    private let maxStack = 4

    var body: some View {
        let theme = appModel.theme
        let categoryEffects = appModel.effectRegistry.mixableEffects(for: selectedCategory)

        NavigationView {
            ScrollView {
                VStack(spacing: CorivoDesign.spacingL) {
                    previewCard(theme: theme)
                    stackSection(theme: theme)
                    effectsSection(theme: theme, effects: categoryEffects)
                }
                .padding(CorivoDesign.screenPadding)
            }
            .navigationTitle(appModel.text("mixes.title", fallback: "Mixes"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(appModel.text("common.close", fallback: "Close")) {
                        saveCurrentProject()
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(appModel.text("mixes.reset", fallback: "Reset")) {
                        mixStack = []
                        renderPreview()
                    }
                    .disabled(mixStack.isEmpty)
                }
            }
            .background(theme.backgrounds.primary.ignoresSafeArea())
        }
        .sheet(isPresented: $showPicker) {
            PhotoGridPickerView { sourcePath, size in
                currentSourcePath = sourcePath
                currentSourceSize = size
                CorivoAssets.resolveImage(sourcePath: sourcePath) { loaded in
                    sourceImage = loaded
                    renderPreview()
                }
            }
            .environmentObject(appModel)
        }
        .task {
            await load()
        }
    }

    private func previewCard(theme: CorivoTheme) -> some View {
        VStack(spacing: CorivoDesign.spacingS) {
            if let previewImage {
                Image(uiImage: previewImage)
                    .resizable()
                    .scaledToFit()
                    .frame(maxWidth: .infinity)
                    .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerXLarge, style: .continuous))
            } else {
                VStack(spacing: CorivoDesign.spacingS) {
                    Text(appModel.text("mixes.noPhotoYet", fallback: "No photo yet"))
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundColor(theme.text.primary)
                    Text(appModel.text("mixes.pickImagePrompt", fallback: "Pick a photo to start building stacked effects."))
                        .font(.system(size: 15))
                        .foregroundColor(theme.text.secondary)
                        .multilineTextAlignment(.center)
                    Button(appModel.text("mixes.pickPhoto", fallback: "Pick Photo")) {
                        showPicker = true
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal, CorivoDesign.spacingL)
                    .padding(.vertical, CorivoDesign.spacingS)
                    .background(theme.accent.primary)
                    .foregroundColor(theme.backgrounds.primary)
                    .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerMedium, style: .continuous))
                }
                .padding(CorivoDesign.spacingXL)
            }

            if sourceImage != nil {
                Button(appModel.text("mixes.changePhoto", fallback: "Change Photo")) {
                    showPicker = true
                }
                .buttonStyle(.plain)
                .foregroundColor(theme.accent.secondary)
            }
        }
        .padding(CorivoDesign.spacingM)
        .corivoCard(theme: theme)
    }

    private func stackSection(theme: CorivoTheme) -> some View {
        VStack(alignment: .leading, spacing: CorivoDesign.spacingS) {
            HStack {
                Text(appModel.text("mixes.stackTitle", fallback: "Mix Stack"))
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(theme.text.primary)
                Spacer()
                Text("\(mixStack.count)/\(maxStack)")
                    .foregroundColor(theme.text.tertiary)
            }

            if mixStack.isEmpty {
                VStack(alignment: .leading, spacing: CorivoDesign.spacingXS) {
                    Text(appModel.text("mixes.emptyTitle", fallback: "No filters selected"))
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundColor(theme.text.primary)
                    Text(appModel.text("mixes.emptySubtitle", fallback: "Pick up to 4 shader-backed effects."))
                        .foregroundColor(theme.text.secondary)
                }
                .padding(CorivoDesign.spacingM)
                .corivoCard(theme: theme)
            } else {
                ForEach(Array(mixStack.enumerated()), id: \.element.id) { index, layer in
                    let effect = appModel.effectRegistry.effect(id: layer.effectId)
                    VStack(alignment: .leading, spacing: CorivoDesign.spacingS) {
                        HStack {
                            Text("\(index + 1)")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(theme.text.primary)
                                .frame(width: 28, height: 28)
                                .background(theme.backgrounds.tertiary)
                                .clipShape(Circle())
                            VStack(alignment: .leading, spacing: 2) {
                                Text(effect.map(appModel.effectName) ?? layer.effectId)
                                    .foregroundColor(theme.text.primary)
                                Text(effect.map { appModel.categoryName($0.category) } ?? "")
                                    .font(.system(size: 13))
                                    .foregroundColor(theme.text.tertiary)
                            }
                            Spacer()
                            Button(layer.visible ? appModel.text("mixes.visibleOn", fallback: "Visible") : appModel.text("mixes.visibleOff", fallback: "Hidden")) {
                                toggleLayerVisibility(layer.id)
                            }
                            .buttonStyle(.plain)
                            .font(.system(size: 11, weight: .medium))
                            .padding(.horizontal, CorivoDesign.spacingS)
                            .padding(.vertical, 5)
                            .background((layer.visible ? theme.semantic.success : theme.semantic.warning).opacity(0.18))
                            .foregroundColor(theme.text.primary)
                            .clipShape(Capsule())
                        }

                        HStack(spacing: CorivoDesign.spacingS) {
                            miniAction(appModel.text("mixes.moveUp", fallback: "Up"), disabled: index == 0) {
                                moveLayer(index, delta: -1)
                            }
                            miniAction(appModel.text("mixes.moveDown", fallback: "Down"), disabled: index == mixStack.count - 1) {
                                moveLayer(index, delta: 1)
                            }
                            Spacer()
                            miniDestructive(appModel.text("mixes.remove", fallback: "Remove")) {
                                removeLayer(layer.id)
                            }
                        }
                    }
                    .padding(CorivoDesign.spacingM)
                    .corivoCard(theme: theme)
                }
            }
        }
    }

    private func effectsSection(theme: CorivoTheme, effects: [EffectDefinition]) -> some View {
        VStack(alignment: .leading, spacing: CorivoDesign.spacingS) {
            HStack {
                Text(appModel.text("mixes.addFiltersTitle", fallback: "Add Filters"))
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(theme.text.primary)
                Spacer()
                Text(appModel.text("mixes.tapToToggle", fallback: "Tap to toggle"))
                    .foregroundColor(theme.text.tertiary)
                    .font(.system(size: 13))
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: CorivoDesign.spacingS) {
                    ForEach(appModel.effectRegistry.categories) { category in
                        Button(appModel.categoryName(category)) {
                            selectedCategory = category
                        }
                        .buttonStyle(.plain)
                        .padding(.horizontal, CorivoDesign.spacingM)
                        .padding(.vertical, 10)
                        .background(selectedCategory == category ? theme.accent.primary : theme.backgrounds.tertiary)
                        .foregroundColor(selectedCategory == category ? theme.backgrounds.primary : theme.text.secondary)
                        .clipShape(Capsule())
                    }
                }
            }

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: CorivoDesign.spacingS) {
                ForEach(effects) { effect in
                    let selected = mixStack.contains(where: { $0.effectId == effect.id })
                    Button {
                        toggleEffect(effect)
                    } label: {
                        VStack(alignment: .leading, spacing: CorivoDesign.spacingS) {
                            AssetIconView(path: effect.iconPath, size: 48)
                            Text(appModel.effectName(effect))
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(theme.text.primary)
                            Text(appModel.categoryName(effect.category))
                                .font(.system(size: 12))
                                .foregroundColor(theme.text.tertiary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(CorivoDesign.spacingM)
                        .background(selected ? theme.backgrounds.tertiary : theme.backgrounds.secondary)
                        .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerLarge, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: CorivoDesign.cornerLarge, style: .continuous)
                                .stroke(selected ? theme.accent.primary : theme.overlays.light, lineWidth: selected ? 2 : 1)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private func load() async {
        selectedCategory = appModel.effectRegistry.categories.first ?? .cellular

        if let projectID, let project = appModel.projectStore.project(id: projectID) {
            currentProjectID = project.id
            currentSourcePath = project.sourceImagePath
            currentSourceSize = project.sourceImageDimensions
            mixStack = project.mixStack ?? []
        } else {
            currentProjectID = nil
            currentSourcePath = sourceImagePath
        }

        guard let currentSourcePath else { return }
        CorivoAssets.resolveImage(sourcePath: currentSourcePath) { loaded in
            sourceImage = loaded
            if currentSourceSize.width == 0 || currentSourceSize.height == 0, let loaded {
                currentSourceSize = PixelSize(width: Double(loaded.size.width), height: Double(loaded.size.height))
            }
            renderPreview()
        }
    }

    private func toggleEffect(_ effect: EffectDefinition) {
        if let index = mixStack.firstIndex(where: { $0.effectId == effect.id }) {
            mixStack.remove(at: index)
        } else if mixStack.count < maxStack {
            mixStack.append(
                EffectLayer(
                    id: "mix_\(UUID().uuidString.prefix(8))",
                    effectId: effect.id,
                    params: appModel.effectRegistry.defaultParameters(for: effect.id),
                    opacity: 1,
                    visible: true,
                    blendMode: .normal
                )
            )
        }
        renderPreview()
    }

    private func moveLayer(_ index: Int, delta: Int) {
        let newIndex = index + delta
        guard mixStack.indices.contains(index), mixStack.indices.contains(newIndex) else { return }
        let item = mixStack.remove(at: index)
        mixStack.insert(item, at: newIndex)
        renderPreview()
    }

    private func toggleLayerVisibility(_ id: String) {
        guard let index = mixStack.firstIndex(where: { $0.id == id }) else { return }
        mixStack[index].visible.toggle()
        renderPreview()
    }

    private func removeLayer(_ id: String) {
        mixStack.removeAll { $0.id == id }
        renderPreview()
    }

    private func renderPreview() {
        guard let sourceImage else {
            previewImage = nil
            return
        }
        let stack = mixStack.isEmpty ? nil : mixStack
        let targetSize = CGSize(width: UIScreen.main.bounds.width - 32, height: 320)
        let pipeline = appModel.renderPipeline
        DispatchQueue.global(qos: .userInitiated).async {
            let image = pipeline.renderPreview(image: sourceImage, effect: nil, mixStack: stack, targetSize: targetSize)
            DispatchQueue.main.async {
                previewImage = image
            }
        }
    }

    private func saveCurrentProject() {
        guard let currentSourcePath, let previewImage else { return }
        let record = appModel.projectStore.upsertMixProject(
            existingProjectID: currentProjectID,
            sourceImagePath: currentSourcePath,
            sourceSize: currentSourceSize,
            thumbnail: previewImage,
            mixStack: mixStack
        )
        currentProjectID = record.id
    }

    private func miniAction(_ title: String, disabled: Bool, action: @escaping () -> Void) -> some View {
        let theme = appModel.theme
        return Button(title, action: action)
            .buttonStyle(.plain)
            .font(.system(size: 13, weight: .medium))
            .padding(.horizontal, CorivoDesign.spacingS)
            .padding(.vertical, 7)
            .background(theme.backgrounds.tertiary)
            .foregroundColor(disabled ? theme.text.tertiary : theme.text.primary)
            .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerMedium, style: .continuous))
            .disabled(disabled)
    }

    private func miniDestructive(_ title: String, action: @escaping () -> Void) -> some View {
        let theme = appModel.theme
        return Button(title, action: action)
            .buttonStyle(.plain)
            .font(.system(size: 13, weight: .medium))
            .padding(.horizontal, CorivoDesign.spacingS)
            .padding(.vertical, 7)
            .background(theme.semantic.error.opacity(0.15))
            .foregroundColor(theme.semantic.error)
            .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerMedium, style: .continuous))
    }
}

struct ExportView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appModel: AppModel

    let image: UIImage

    @State private var activityURL: URL?
    @State private var showActivity = false
    @State private var alertItem: AlertItem?

    var body: some View {
        let theme = appModel.theme

        NavigationView {
            VStack(spacing: CorivoDesign.spacingL) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 320)
                    .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerXLarge, style: .continuous))
                    .padding(.horizontal, CorivoDesign.screenPadding)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: CorivoDesign.spacingS) {
                    exportButton(title: "Instagram", iconPath: "icons/export/Instagram.png", theme: theme) {
                        shareToInstagram()
                    }
                    exportButton(title: "X", iconPath: "icons/export/X.png", theme: theme) {
                        openShareSheet()
                    }
                    exportButton(title: "Gallery", iconPath: "icons/export/Gallery.png", theme: theme) {
                        saveToPhotos()
                    }
                    exportButton(title: "Files", iconPath: "icons/export/Files.png", theme: theme) {
                        openShareSheet()
                    }
                    exportButton(title: "Share", iconPath: "icons/export/Share.png", theme: theme) {
                        openShareSheet()
                    }
                }
                .padding(.horizontal, CorivoDesign.screenPadding)

                Spacer()
            }
            .navigationTitle("Export")
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
        .sheet(isPresented: $showActivity) {
            if let activityURL {
                ActivityView(items: [activityURL])
            }
        }
        .alert(item: $alertItem) { item in
            Alert(title: Text(item.title), message: Text(item.message), dismissButton: .default(Text("OK")))
        }
    }

    private func exportButton(title: String, iconPath: String, theme: CorivoTheme, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: CorivoDesign.spacingS) {
                AssetIconView(path: iconPath, size: 52)
                Text(title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(theme.text.primary)
            }
            .frame(maxWidth: .infinity, minHeight: 120)
            .background(theme.backgrounds.secondary)
            .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerLarge, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: CorivoDesign.cornerLarge, style: .continuous)
                    .stroke(theme.overlays.light, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private func openShareSheet() {
        guard let url = appModel.projectStore.exportRenderedImage(image, format: appModel.preferences.defaultExportFormat, quality: appModel.preferences.defaultExportQuality) else {
            alertItem = AlertItem(title: "Error", message: "Failed to prepare export")
            return
        }
        activityURL = url
        showActivity = true
    }

    private func saveToPhotos() {
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                DispatchQueue.main.async {
                    alertItem = AlertItem(title: "Error", message: "Failed to save image")
                }
                return
            }
            UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
            DispatchQueue.main.async {
                alertItem = AlertItem(title: "Success", message: "Image saved to Photos!")
            }
        }
    }

    private func shareToInstagram() {
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                DispatchQueue.main.async {
                    alertItem = AlertItem(title: "Instagram not installed", message: "Please install Instagram to share.")
                }
                return
            }

            var placeholderID: String?
            PHPhotoLibrary.shared().performChanges({
                let request = PHAssetChangeRequest.creationRequestForAsset(from: image)
                placeholderID = request.placeholderForCreatedAsset?.localIdentifier
            }) { success, _ in
                guard success, let placeholderID else {
                    DispatchQueue.main.async {
                        alertItem = AlertItem(title: "Error", message: "Failed to share to Instagram")
                    }
                    return
                }

                let encoded = placeholderID.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? placeholderID
                let url = URL(string: "instagram://library?LocalIdentifier=\(encoded)")!
                DispatchQueue.main.async {
                    if UIApplication.shared.canOpenURL(url) {
                        UIApplication.shared.open(url)
                    } else {
                        alertItem = AlertItem(title: "Instagram not installed", message: "Please install Instagram to share.")
                    }
                }
            }
        }
    }
}

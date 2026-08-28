import SwiftUI

struct HomeContainerView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var activeSheet: HomeSheet?
    @State private var editorSession: EditorSession?

    var body: some View {
        HomeView(
            onOpenImagePicker: {
                CorivoHaptics.impact(.medium, enabled: appModel.preferences.hapticFeedback)
                activeSheet = .imagePicker { sourcePath, size in
                    editorSession = EditorSession(projectID: nil, sourceImagePath: sourcePath, sourceSize: size)
                }
            },
            onOpenRecents: {
                CorivoHaptics.selection(enabled: appModel.preferences.hapticFeedback)
                activeSheet = .recents
            },
            onOpenMixes: {
                CorivoHaptics.selection(enabled: appModel.preferences.hapticFeedback)
                activeSheet = .mixes()
            },
            onOpenSettings: {
                CorivoHaptics.selection(enabled: appModel.preferences.hapticFeedback)
                activeSheet = .settings
            },
            onOpenAbout: {
                CorivoHaptics.selection(enabled: appModel.preferences.hapticFeedback)
                activeSheet = .about
            }
        )
        .sheet(item: $activeSheet) { sheet in
            switch sheet {
            case .recents:
                RecentProjectsView { project in
                    activeSheet = nil
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                        if project.mixStack?.isEmpty == false {
                            activeSheet = .mixes(projectID: project.id, sourceImagePath: project.sourceImagePath)
                        } else {
                            editorSession = EditorSession(
                                projectID: project.id,
                                sourceImagePath: project.sourceImagePath,
                                sourceSize: project.sourceImageDimensions
                            )
                        }
                    }
                }
                .environmentObject(appModel)
            case let .mixes(projectID, sourceImagePath):
                MixesView(projectID: projectID, sourceImagePath: sourceImagePath)
                    .environmentObject(appModel)
            case .settings:
                SettingsView {
                    activeSheet = .about
                }
                .environmentObject(appModel)
            case .about:
                AboutView()
                    .environmentObject(appModel)
            case let .imagePicker(onSelect):
                PhotoGridPickerView(onSelect: onSelect)
                    .environmentObject(appModel)
            }
        }
        .fullScreenCover(item: $editorSession) { session in
            EditorView(session: session)
                .environmentObject(appModel)
        }
    }
}

struct HomeView: View {
    @EnvironmentObject private var appModel: AppModel

    let onOpenImagePicker: () -> Void
    let onOpenRecents: () -> Void
    let onOpenMixes: () -> Void
    let onOpenSettings: () -> Void
    let onOpenAbout: () -> Void

    var body: some View {
        let theme = appModel.theme
        let actions = [
            RadialAction(
                id: "settings",
                label: appModel.text("settings.title", fallback: "Settings"),
                iconPath: "icons/homescreenMenu/setting.png",
                action: onOpenSettings
            ),
            RadialAction(
                id: "recent",
                label: appModel.text("home.recent", fallback: "Recent"),
                iconPath: "icons/homescreenMenu/recents.png",
                action: onOpenRecents
            ),
            RadialAction(
                id: "mixes",
                label: appModel.text("home.mixes", fallback: "Mixes"),
                iconPath: "icons/homescreenMenu/mixes.png",
                action: onOpenMixes
            ),
            RadialAction(
                id: "about",
                label: appModel.text("settings.about", fallback: "About"),
                iconPath: "icons/homescreenMenu/about.png",
                action: onOpenAbout
            ),
        ]

        VStack {
            VStack(spacing: CorivoDesign.spacingXS) {
                Text("Corivo")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(theme.text.primary)
                Text(appModel.text("home.tapToStartEditing", fallback: "Tap to start editing"))
                    .font(.system(size: 16, weight: .regular))
                    .foregroundColor(theme.text.secondary)
            }
            .padding(.top, CorivoDesign.spacingXL)

            LiquidRadialMenuView(
                theme: theme,
                centerIconPath: "icons/homescreenMenu/main.png",
                centerLabel: appModel.text("home.startEditing", fallback: "Start Editing"),
                actions: actions,
                onCenterTap: onOpenImagePicker
            )

            Text(appModel.text("home.selectImageHint", fallback: "Select an image to apply stunning effects"))
                .font(.system(size: 14, weight: .regular))
                .foregroundColor(theme.text.tertiary)
                .padding(.bottom, CorivoDesign.spacingXL)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(theme.backgrounds.primary.ignoresSafeArea())
    }
}

import SwiftUI

struct RecentProjectsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appModel: AppModel

    let onOpenProject: (ProjectRecord) -> Void

    @State private var pendingDelete: ProjectRecord?
    @State private var renamingProject: ProjectRecord?

    var body: some View {
        let theme = appModel.theme

        NavigationView {
            Group {
                if appModel.projectStore.projects.isEmpty {
                    VStack(spacing: CorivoDesign.spacingM) {
                        Text("📂")
                            .font(.system(size: 62))
                            .opacity(0.3)
                        Text(appModel.text("recents.emptyState.title", fallback: "No Recent Projects"))
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundColor(theme.text.primary)
                        Text(appModel.text("recents.emptyState.subtitle", fallback: "Your edited projects will appear here"))
                            .font(.system(size: 16))
                            .foregroundColor(theme.text.tertiary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(CorivoDesign.spacingXL)
                } else {
                    ScrollView {
                        LazyVStack(spacing: CorivoDesign.spacingS) {
                            ForEach(appModel.projectStore.projects) { project in
                                RecentProjectRow(project: project) {
                                    CorivoHaptics.impact(.light, enabled: appModel.preferences.hapticFeedback)
                                    dismiss()
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                                        onOpenProject(project)
                                    }
                                }
                                .contextMenu {
                                    Button("Duplicate") {
                                        appModel.projectStore.duplicateProject(project.id)
                                    }
                                    Button("Rename") {
                                        renamingProject = project
                                    }
                                    Button("Delete", role: .destructive) {
                                        pendingDelete = project
                                    }
                                }
                                .swipeActions {
                                    Button(role: .destructive) {
                                        pendingDelete = project
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                            }
                        }
                        .padding(CorivoDesign.screenPadding)
                    }
                }
            }
            .navigationTitle(appModel.text("recents.title", fallback: "Recent Projects"))
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
        .alert(item: $pendingDelete) { project in
            Alert(
                title: Text(appModel.text("recents.deleteConfirmation.title", fallback: "Delete Project")),
                message: Text(appModel.text("recents.deleteConfirmation.message", fallback: "Are you sure you want to delete this project? This cannot be undone.")),
                primaryButton: .destructive(Text(appModel.text("common.delete", fallback: "Delete"))) {
                    appModel.projectStore.deleteProjects([project.id])
                },
                secondaryButton: .cancel(Text(appModel.text("common.cancel", fallback: "Cancel")))
            )
        }
        .sheet(item: $renamingProject) { project in
            RenameProjectView(project: project) { newName in
                appModel.projectStore.renameProject(project.id, name: newName)
            }
        }
    }
}

struct RecentProjectRow: View {
    @EnvironmentObject private var appModel: AppModel
    let project: ProjectRecord
    let onTap: () -> Void

    var body: some View {
        let theme = appModel.theme

        Button(action: onTap) {
            HStack(spacing: CorivoDesign.spacingM) {
                ProjectThumbnailView(path: project.thumbnailPath)
                    .frame(width: 72, height: 72)
                    .clipShape(RoundedRectangle(cornerRadius: CorivoDesign.cornerSmall, style: .continuous))

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: CorivoDesign.spacingXS) {
                        Text(project.name ?? "Untitled Project")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundColor(theme.text.primary)
                            .lineLimit(1)
                        if project.mixStack?.isEmpty == false {
                            Text("Mixed")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(theme.text.secondary)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 3)
                                .background(theme.backgrounds.tertiary)
                                .clipShape(Capsule())
                        }
                    }
                    Text(relativeTimestamp(from: project.updatedAt))
                        .font(.system(size: 13))
                        .foregroundColor(theme.text.secondary)
                    Text("\(project.elementCount) element\(project.elementCount == 1 ? "" : "s")")
                        .font(.system(size: 13))
                        .foregroundColor(theme.text.tertiary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(theme.text.tertiary)
            }
            .padding(CorivoDesign.spacingS)
            .corivoCard(theme: theme)
        }
        .buttonStyle(.plain)
    }
}

struct ProjectThumbnailView: View {
    let path: String
    @State private var image: UIImage?

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Rectangle()
                    .fill(Color.black.opacity(0.18))
                    .overlay(Text("🖼️").font(.system(size: 26)))
            }
        }
        .task {
            guard image == nil else { return }
            CorivoAssets.resolveImage(sourcePath: path) { loaded in
                image = loaded
            }
        }
    }
}

struct RenameProjectView: View {
    @Environment(\.dismiss) private var dismiss
    let project: ProjectRecord
    let onSave: (String) -> Void

    @State private var name: String = ""

    var body: some View {
        NavigationView {
            Form {
                TextField("Enter project name", text: $name)
            }
            .navigationTitle("Rename Project")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave(name.trimmingCharacters(in: .whitespacesAndNewlines))
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
        .onAppear {
            name = project.name ?? ""
        }
    }
}

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appModel: AppModel

    let onOpenAbout: () -> Void

    @State private var themeDialog = false
    @State private var languageDialog = false
    @State private var alertItem: AlertItem?

    var body: some View {
        let theme = appModel.theme

        NavigationView {
            ScrollView {
                VStack(spacing: CorivoDesign.spacingL) {
                    settingsSection(title: appModel.text("settings.appearance", fallback: "Appearance")) {
                        valueRow(title: appModel.text("settings.theme", fallback: "Theme"), value: appModel.text("settings.theme\(appModel.preferences.theme.rawValue.capitalized)", fallback: appModel.preferences.theme.rawValue.capitalized)) {
                            themeDialog = true
                        }
                        valueRow(title: appModel.text("settings.language", fallback: "Language"), value: appModel.localization.languageName(for: appModel.currentLanguage)) {
                            languageDialog = true
                        }
                    }

                    settingsSection(title: appModel.text("settings.preferences", fallback: "Preferences")) {
                        toggleRow(
                            title: appModel.text("settings.autoSaveProjects", fallback: "Auto-Save Projects"),
                            subtitle: appModel.text("settings.autoSaveProjectsDesc", fallback: "Automatically save every 30 seconds"),
                            isOn: Binding(get: { appModel.preferences.autoSaveProjects }, set: appModel.updateAutoSave)
                        )
                        toggleRow(
                            title: appModel.text("settings.hapticFeedback", fallback: "Haptic Feedback"),
                            subtitle: appModel.text("settings.hapticFeedbackDesc", fallback: "Vibration for interactions"),
                            isOn: Binding(get: { appModel.preferences.hapticFeedback }, set: appModel.updateHaptics)
                        )
                        toggleRow(
                            title: appModel.text("settings.confirmDelete", fallback: "Confirm before deleting"),
                            subtitle: appModel.text("settings.confirmDeleteDesc", fallback: "Show confirmation dialog when deleting projects"),
                            isOn: Binding(get: { appModel.preferences.confirmDelete }, set: appModel.updateConfirmDelete)
                        )
                        toggleRow(
                            title: appModel.text("settings.sound", fallback: "Sound"),
                            subtitle: nil,
                            isOn: Binding(get: { appModel.preferences.soundEnabled }, set: appModel.updateSound)
                        )
                    }

                    settingsSection(title: appModel.text("settings.account", fallback: "Account")) {
                        valueRow(title: appModel.text("settings.defaultExportFormat", fallback: "Default Export Format"), value: appModel.preferences.defaultExportFormat.rawValue.uppercased()) {
                            appModel.updateExportFormat(appModel.preferences.defaultExportFormat == .png ? .jpg : .png)
                        }
                        valueRow(title: appModel.text("settings.defaultExportQuality", fallback: "Default Export Quality"), value: "\(Int(appModel.preferences.defaultExportQuality))") {
                            appModel.updateExportQuality(appModel.preferences.defaultExportQuality == 100 ? 90 : 100)
                        }
                    }

                    settingsSection(title: appModel.text("settings.about", fallback: "About")) {
                        valueRow(title: appModel.text("settings.about", fallback: "About"), value: "") {
                            onOpenAbout()
                        }
                    }

                    settingsSection(title: appModel.text("settings.dangerZone", fallback: "Danger Zone")) {
                        destructiveRow(title: appModel.text("settings.exportAllProjects", fallback: "Export All Projects")) {
                            alertItem = AlertItem(title: "Export All Projects", message: "This Pro feature will be implemented")
                        }
                        destructiveRow(title: appModel.text("settings.clearCache", fallback: "Clear Cache")) {
                            alertItem = AlertItem(title: "Clear Cache", message: "Cache cleared")
                        }
                        destructiveRow(title: appModel.text("settings.deleteAllProjects", fallback: "Delete All Projects")) {
                            alertItem = AlertItem(title: "Delete All Projects", message: "All projects deleted")
                        }
                        destructiveRow(title: appModel.text("settings.resetOnboarding", fallback: "Reset Onboarding")) {
                            appModel.resetOnboarding()
                            alertItem = AlertItem(title: "Onboarding Reset", message: "The app will now show the onboarding screens again.")
                        }
                    }
                }
                .padding(CorivoDesign.screenPadding)
            }
            .navigationTitle(appModel.text("settings.title", fallback: "Settings"))
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
        .alert(item: $alertItem) { item in
            Alert(title: Text(item.title), message: Text(item.message), dismissButton: .default(Text("OK")))
        }
        .confirmationDialog(appModel.text("settings.theme", fallback: "Theme"), isPresented: $themeDialog) {
            ForEach(ThemeType.allCases) { themeOption in
                Button(appModel.text("settings.theme\(themeOption.rawValue.capitalized)", fallback: themeOption.rawValue.capitalized)) {
                    appModel.setTheme(themeOption)
                }
            }
        }
        .confirmationDialog(appModel.text("settings.language", fallback: "Language"), isPresented: $languageDialog) {
            ForEach(appModel.localization.supportedLanguages, id: \.self) { language in
                Button(appModel.localization.languageName(for: language)) {
                    appModel.setLanguage(language)
                }
            }
        }
    }

    @ViewBuilder
    private func settingsSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        let theme = appModel.theme
        VStack(alignment: .leading, spacing: CorivoDesign.spacingS) {
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .textCase(.uppercase)
                .foregroundColor(theme.text.tertiary)
            VStack(spacing: 0) {
                content()
            }
            .corivoCard(theme: theme)
        }
    }

    private func valueRow(title: String, value: String, action: @escaping () -> Void) -> some View {
        let theme = appModel.theme
        return Button(action: action) {
            HStack {
                Text(title)
                    .foregroundColor(theme.text.primary)
                Spacer()
                if !value.isEmpty {
                    Text(value)
                        .foregroundColor(theme.text.secondary)
                }
                Image(systemName: "chevron.right")
                    .foregroundColor(theme.text.tertiary)
            }
            .padding(CorivoDesign.spacingM)
        }
        .buttonStyle(.plain)
    }

    private func destructiveRow(title: String, action: @escaping () -> Void) -> some View {
        let theme = appModel.theme
        return Button(action: action) {
            HStack {
                Text(title)
                    .foregroundColor(theme.semantic.error)
                Spacer()
            }
            .padding(CorivoDesign.spacingM)
        }
        .buttonStyle(.plain)
    }

    private func toggleRow(title: String, subtitle: String?, isOn: Binding<Bool>) -> some View {
        let theme = appModel.theme
        return Toggle(isOn: isOn) {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .foregroundColor(theme.text.primary)
                if let subtitle {
                    Text(subtitle)
                        .font(.system(size: 13))
                        .foregroundColor(theme.text.tertiary)
                }
            }
        }
        .toggleStyle(SwitchToggleStyle(tint: theme.accent.primary))
        .padding(CorivoDesign.spacingM)
    }
}

struct AboutView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var appModel: AppModel
    @State private var alertItem: AlertItem?

    var body: some View {
        let theme = appModel.theme

        NavigationView {
            ScrollView {
                VStack(spacing: CorivoDesign.spacingL) {
                    section {
                        infoRow(title: appModel.text("settings.version", fallback: "Version"), value: "1.0.0")
                        actionRow(title: appModel.text("settings.rateApp", fallback: "Rate Corivo")) {
                            alertItem = AlertItem(title: "Rate Corivo", message: "This will open the App Store rating dialog")
                        }
                        actionRow(title: appModel.text("settings.contactSupport", fallback: "Contact Support")) {
                            alertItem = AlertItem(title: "Contact Support", message: "This will open email composer to support@corivo.app")
                        }
                        actionRow(title: appModel.text("settings.privacyPolicy", fallback: "Privacy Policy")) {
                            alertItem = AlertItem(title: appModel.text("settings.privacyPolicy", fallback: "Privacy Policy"), message: "This will open corivo.app/privacy")
                        }
                        actionRow(title: appModel.text("settings.termsOfService", fallback: "Terms of Service")) {
                            alertItem = AlertItem(title: appModel.text("settings.termsOfService", fallback: "Terms of Service"), message: "This will open corivo.app/terms")
                        }
                    }
                }
                .padding(CorivoDesign.screenPadding)
            }
            .navigationTitle(appModel.text("settings.about", fallback: "About"))
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
        .alert(item: $alertItem) { item in
            Alert(title: Text(item.title), message: Text(item.message), dismissButton: .default(Text("OK")))
        }
    }

    @ViewBuilder
    private func section<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        let theme = appModel.theme
        VStack(spacing: 0) { content() }
            .corivoCard(theme: theme)
    }

    private func infoRow(title: String, value: String) -> some View {
        let theme = appModel.theme
        return HStack {
            Text(title)
                .foregroundColor(theme.text.primary)
            Spacer()
            Text(value)
                .foregroundColor(theme.text.secondary)
        }
        .padding(CorivoDesign.spacingM)
    }

    private func actionRow(title: String, action: @escaping () -> Void) -> some View {
        let theme = appModel.theme
        return Button(action: action) {
            HStack {
                Text(title)
                    .foregroundColor(theme.text.primary)
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(theme.text.tertiary)
            }
            .padding(CorivoDesign.spacingM)
        }
        .buttonStyle(.plain)
    }
}

import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var showSplash = true

    var body: some View {
        Group {
            if showSplash {
                SplashView()
            } else if !appModel.hasSeenOnboarding {
                OnboardingView()
            } else {
                HomeContainerView()
            }
        }
        .background(appModel.theme.backgrounds.primary.ignoresSafeArea())
        .preferredColorScheme(colorScheme)
        .task {
            guard showSplash else { return }
            try? await Task.sleep(nanoseconds: 2_800_000_000)
            withAnimation(.easeOut(duration: 0.3)) {
                showSplash = false
            }
        }
    }

    private var colorScheme: ColorScheme? {
        switch appModel.preferences.colorScheme {
        case .auto:
            return nil
        case .light:
            return .light
        case .dark:
            return .dark
        }
    }
}

import SwiftUI

struct SplashView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var logoOpacity = 0.0
    @State private var logoScale = 0.5
    @State private var rotation = 0.0
    @State private var textOpacity = 0.0
    @State private var textOffset = 30.0

    var body: some View {
        VStack(spacing: 40) {
            ZStack {
                Circle()
                    .stroke(Color(hex: "#6366F1"), lineWidth: 4)
                    .frame(width: 120, height: 120)
                Circle()
                    .stroke(Color(hex: "#EC4899"), lineWidth: 4)
                    .frame(width: 80, height: 80)
            }
            .opacity(logoOpacity)
            .scaleEffect(logoScale)
            .rotation3DEffect(.degrees(rotation), axis: (x: 0, y: 1, z: 0))

            VStack(spacing: 8) {
                Text("PixelFX")
                    .font(.system(size: 36, weight: .bold))
                    .tracking(4)
                    .foregroundColor(.white)
                Text(appModel.text("splash.tagline", fallback: "Professional Image Effects"))
                    .font(.system(size: 14, weight: .regular))
                    .tracking(1)
                    .foregroundColor(Color(hex: "#9CA3AF"))
            }
            .opacity(textOpacity)
            .offset(y: textOffset)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(hex: "#0F0F1E").ignoresSafeArea())
        .task {
            withAnimation(.easeOut(duration: 0.8)) {
                logoOpacity = 1
                logoScale = 1
            }
            try? await Task.sleep(nanoseconds: 1_000_000_000)
            withAnimation(.easeOut(duration: 0.6)) {
                rotation = 360
            }
            try? await Task.sleep(nanoseconds: 1_000_000_000)
            withAnimation(.easeOut(duration: 0.6)) {
                textOpacity = 1
                textOffset = 0
            }
        }
    }
}

struct OnboardingView: View {
    @EnvironmentObject private var appModel: AppModel
    @State private var page = 0

    var body: some View {
        let theme = appModel.theme

        VStack(spacing: 0) {
            HStack {
                Spacer()
                Button(appModel.text("onboarding.skip", fallback: "Skip")) {
                    appModel.setOnboardingSeen()
                }
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(theme.text.secondary)
                .padding(PixelFXDesign.screenPadding)
            }

            TabView(selection: $page) {
                OnboardingPageView(
                    title: appModel.text("onboarding.effectsHeadline", fallback: "Professional Effects"),
                    bodyText: appModel.text("onboarding.effectsBody", fallback: "50+ GPU-powered effects across 12 categories."),
                    theme: theme,
                    artwork: AnyView(EffectsArtworkView())
                )
                .tag(0)

                OnboardingPageView(
                    title: appModel.text("onboarding.saveShareHeadline", fallback: "Save & Share"),
                    bodyText: appModel.text("onboarding.saveShareBody", fallback: "Auto-save projects with thumbnails and export in high resolution."),
                    theme: theme,
                    artwork: AnyView(ProjectsArtworkView())
                )
                .tag(1)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))

            HStack(spacing: 10) {
                ForEach(0..<2, id: \.self) { index in
                    Capsule()
                        .fill(index == page ? theme.accent.primary : theme.overlays.light)
                        .frame(width: index == page ? 24 : 8, height: 8)
                }
            }
            .padding(.bottom, PixelFXDesign.spacingL)

            Button(page == 1 ? appModel.text("onboarding.getStarted", fallback: "Get Started") : appModel.text("common.done", fallback: "Done")) {
                if page == 1 {
                    appModel.setOnboardingSeen()
                } else {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.9)) {
                        page = 1
                    }
                }
            }
            .buttonStyle(.plain)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(theme.accent.primary)
            .foregroundColor(theme.backgrounds.primary)
            .clipShape(RoundedRectangle(cornerRadius: PixelFXDesign.cornerLarge, style: .continuous))
            .padding(.horizontal, PixelFXDesign.screenPadding)
            .padding(.bottom, PixelFXDesign.spacingXL)
        }
        .background(
            LinearGradient(
                colors: [Color(hex: "#0F0F12"), Color(hex: "#1A1A1D")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
    }
}

struct OnboardingPageView: View {
    let title: String
    let bodyText: String
    let theme: PixelFXTheme
    let artwork: AnyView

    var body: some View {
        VStack(spacing: PixelFXDesign.spacingXL) {
            Spacer(minLength: PixelFXDesign.spacingXL)
            artwork
                .frame(height: 260)
            VStack(spacing: PixelFXDesign.spacingM) {
                Text(title)
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundColor(theme.text.primary)
                    .multilineTextAlignment(.center)
                Text(bodyText)
                    .font(.system(size: 16, weight: .regular))
                    .foregroundColor(theme.text.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, PixelFXDesign.spacingL)
            }
            Spacer()
        }
    }
}

struct EffectsArtworkView: View {
    private let iconPaths = [
        "icons/filters/pixelate_strong.png",
        "icons/filters/quad_mirror.png",
        "icons/filters/oil_paintish_bold.png",
        "icons/filters/rgb_split_big.png",
    ]

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color(hex: "#1F1F2E"))
                .frame(width: 280, height: 200)

            VStack(spacing: 16) {
                HStack(spacing: 16) {
                    ForEach(iconPaths.prefix(2), id: \.self) { path in
                        AssetIconView(path: path, size: 72)
                    }
                }
                HStack(spacing: 16) {
                    ForEach(iconPaths.suffix(2), id: \.self) { path in
                        AssetIconView(path: path, size: 72)
                    }
                }
            }

            VStack {
                Spacer()
                Capsule()
                    .fill(Color(hex: "#6366F1"))
                    .frame(width: 140, height: 6)
                    .overlay(alignment: .trailing) {
                        Circle()
                            .fill(Color.white)
                            .frame(width: 18, height: 18)
                    }
                    .padding(.bottom, 18)
            }
            .frame(width: 280, height: 200)
        }
    }
}

struct ProjectsArtworkView: View {
    private let iconPaths = [
        "icons/export/Instagram.png",
        "icons/export/X.png",
        "icons/export/Gallery.png",
        "icons/export/Files.png",
    ]

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color(hex: "#1F1F2E"))
                .frame(width: 280, height: 200)

            VStack(spacing: 12) {
                HStack(spacing: 12) {
                    thumbnailCard(color: Color(hex: "#6366F1"), selected: false)
                    thumbnailCard(color: Color(hex: "#10B981"), selected: true)
                    thumbnailCard(color: Color(hex: "#EC4899"), selected: false)
                }

                HStack(spacing: 12) {
                    ForEach(iconPaths, id: \.self) { path in
                        AssetIconView(path: path, size: 38)
                    }
                }
            }
        }
    }

    private func thumbnailCard(color: Color, selected: Bool) -> some View {
        RoundedRectangle(cornerRadius: 16, style: .continuous)
            .fill(Color(hex: "#14141D"))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(selected ? color : Color.white.opacity(0.08), lineWidth: 2)
            )
            .frame(width: 76, height: 92)
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(color.opacity(0.85))
                    .frame(width: 54, height: 44)
                    .offset(y: -10)
            )
    }
}

import SwiftUI

struct PixelFXTheme {
    let backgrounds: BackgroundPalette
    let text: TextPalette
    let accent: AccentPalette
    let semantic: SemanticPalette
    let overlays: OverlayPalette
    let statusBarStyle: UIStatusBarStyle
}

struct BackgroundPalette {
    let primary: Color
    let secondary: Color
    let tertiary: Color
    let overlay: Color
}

struct TextPalette {
    let primary: Color
    let secondary: Color
    let tertiary: Color
    let subtle: Color
}

struct AccentPalette {
    let primary: Color
    let hover: Color
    let secondary: Color
}

struct SemanticPalette {
    let success: Color
    let error: Color
    let warning: Color
    let info: Color
}

struct OverlayPalette {
    let light: Color
    let dark: Color
    let blur: Color
}

enum PixelFXDesign {
    static let spacingXXS: CGFloat = 4
    static let spacingXS: CGFloat = 8
    static let spacingS: CGFloat = 12
    static let spacingM: CGFloat = 16
    static let spacingL: CGFloat = 24
    static let spacingXL: CGFloat = 32
    static let spacingXXL: CGFloat = 48
    static let screenPadding: CGFloat = 16
    static let cornerSmall: CGFloat = 8
    static let cornerMedium: CGFloat = 12
    static let cornerLarge: CGFloat = 16
    static let cornerXLarge: CGFloat = 24
    static let minTapTarget: CGFloat = 44

    static func titleFont(_ size: CGFloat, weight: Font.Weight) -> Font {
        .system(size: size, weight: weight, design: .default)
    }

    static let themes: [ThemeType: PixelFXTheme] = [
        .dark: PixelFXTheme(
            backgrounds: BackgroundPalette(
                primary: Color(hex: "#0F0F12"),
                secondary: Color(hex: "#1A1A1D"),
                tertiary: Color(hex: "#2A2A2E"),
                overlay: Color.black.opacity(0.6)
            ),
            text: TextPalette(
                primary: Color.white,
                secondary: Color(hex: "#A0A0A0"),
                tertiary: Color(hex: "#808080"),
                subtle: Color(hex: "#606060")
            ),
            accent: AccentPalette(
                primary: Color(hex: "#D4AF37"),
                hover: Color(hex: "#C5A028"),
                secondary: Color(hex: "#0A84FF")
            ),
            semantic: SemanticPalette(
                success: Color(hex: "#34C759"),
                error: Color(hex: "#FF3B30"),
                warning: Color(hex: "#FF9500"),
                info: Color(hex: "#0A84FF")
            ),
            overlays: OverlayPalette(
                light: Color.white.opacity(0.1),
                dark: Color.black.opacity(0.4),
                blur: Color(hex: "#1A1A1D").opacity(0.85)
            ),
            statusBarStyle: .lightContent
        ),
        .light: PixelFXTheme(
            backgrounds: BackgroundPalette(
                primary: Color(hex: "#FFFFFF"),
                secondary: Color(hex: "#F5F5F7"),
                tertiary: Color(hex: "#E8E8ED"),
                overlay: Color.black.opacity(0.3)
            ),
            text: TextPalette(
                primary: Color.black,
                secondary: Color(hex: "#3C3C43"),
                tertiary: Color(hex: "#8E8E93"),
                subtle: Color(hex: "#C7C7CC")
            ),
            accent: AccentPalette(
                primary: Color(hex: "#D4AF37"),
                hover: Color(hex: "#C5A028"),
                secondary: Color(hex: "#007AFF")
            ),
            semantic: SemanticPalette(
                success: Color(hex: "#34C759"),
                error: Color(hex: "#FF3B30"),
                warning: Color(hex: "#FF9500"),
                info: Color(hex: "#007AFF")
            ),
            overlays: OverlayPalette(
                light: Color.black.opacity(0.05),
                dark: Color.black.opacity(0.2),
                blur: Color.white.opacity(0.85)
            ),
            statusBarStyle: .darkContent
        ),
        .solar: PixelFXTheme(
            backgrounds: BackgroundPalette(
                primary: Color(hex: "#FFF9E6"),
                secondary: Color(hex: "#FFF4D1"),
                tertiary: Color(hex: "#FFEDB8"),
                overlay: Color(hex: "#FFF3CC").opacity(0.6)
            ),
            text: TextPalette(
                primary: Color(hex: "#3D2800"),
                secondary: Color(hex: "#6B4A00"),
                tertiary: Color(hex: "#997000"),
                subtle: Color(hex: "#C79600")
            ),
            accent: AccentPalette(
                primary: Color(hex: "#FF9500"),
                hover: Color(hex: "#E68600"),
                secondary: Color(hex: "#FF6B00")
            ),
            semantic: SemanticPalette(
                success: Color(hex: "#52C41A"),
                error: Color(hex: "#F5222D"),
                warning: Color(hex: "#FA8C16"),
                info: Color(hex: "#1890FF")
            ),
            overlays: OverlayPalette(
                light: Color(hex: "#FFF3CC").opacity(0.3),
                dark: Color(hex: "#3D2800").opacity(0.2),
                blur: Color(hex: "#FFF9E6").opacity(0.85)
            ),
            statusBarStyle: .darkContent
        ),
        .mono: PixelFXTheme(
            backgrounds: BackgroundPalette(
                primary: Color(hex: "#1C1C1E"),
                secondary: Color(hex: "#2C2C2E"),
                tertiary: Color(hex: "#3A3A3C"),
                overlay: Color(hex: "#1C1C1E").opacity(0.6)
            ),
            text: TextPalette(
                primary: Color.white,
                secondary: Color(hex: "#AEAEB2"),
                tertiary: Color(hex: "#8E8E93"),
                subtle: Color(hex: "#636366")
            ),
            accent: AccentPalette(
                primary: Color.white,
                hover: Color(hex: "#E5E5EA"),
                secondary: Color(hex: "#C7C7CC")
            ),
            semantic: SemanticPalette(
                success: Color.white,
                error: Color(hex: "#8E8E93"),
                warning: Color(hex: "#AEAEB2"),
                info: Color(hex: "#C7C7CC")
            ),
            overlays: OverlayPalette(
                light: Color.white.opacity(0.1),
                dark: Color.black.opacity(0.4),
                blur: Color(hex: "#2C2C2E").opacity(0.85)
            ),
            statusBarStyle: .lightContent
        ),
    ]
}

extension Color {
    init(hex: String) {
        let sanitized = hex.replacingOccurrences(of: "#", with: "")
        var value: UInt64 = 0
        Scanner(string: sanitized).scanHexInt64(&value)
        let red = Double((value >> 16) & 0xFF) / 255.0
        let green = Double((value >> 8) & 0xFF) / 255.0
        let blue = Double(value & 0xFF) / 255.0
        self.init(red: red, green: green, blue: blue)
    }
}

extension View {
    func pixelFXCard(theme: PixelFXTheme) -> some View {
        background(theme.backgrounds.secondary)
            .clipShape(RoundedRectangle(cornerRadius: PixelFXDesign.cornerLarge, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: PixelFXDesign.cornerLarge, style: .continuous)
                    .stroke(theme.overlays.light, lineWidth: 1)
            )
    }

    func pixelFXButtonBackground(theme: PixelFXTheme, accent: Bool = false) -> some View {
        background(accent ? theme.accent.primary : theme.backgrounds.tertiary)
            .clipShape(RoundedRectangle(cornerRadius: PixelFXDesign.cornerMedium, style: .continuous))
    }
}

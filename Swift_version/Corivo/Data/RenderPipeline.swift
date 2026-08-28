import CoreImage
import CoreImage.CIFilterBuiltins
import UIKit

final class RenderPipeline {
    private let context = CIContext(options: [.useSoftwareRenderer: false])

    func renderPreview(
        sourcePath: String,
        effect: ProjectEffect?,
        mixStack: [EffectLayer]? = nil,
        targetSize: CGSize? = nil
    ) -> UIImage? {
        guard let image = CorivoAssets.resolveImageSynchronously(sourcePath: sourcePath) else { return nil }
        return renderPreview(image: image, effect: effect, mixStack: mixStack, targetSize: targetSize)
    }

    func renderPreview(
        image: UIImage,
        effect: ProjectEffect?,
        mixStack: [EffectLayer]? = nil,
        targetSize: CGSize? = nil
    ) -> UIImage? {
        guard let input = CIImage(image: image) else { return image }
        let rendered = apply(effect: effect, mixStack: mixStack, to: input)
        let finalImage = targetSize.map { resize(rendered, toFit: $0) } ?? rendered
        return makeUIImage(from: finalImage)
    }

    func apply(effect: ProjectEffect?, mixStack: [EffectLayer]? = nil, to input: CIImage) -> CIImage {
        if let mixStack, !mixStack.isEmpty {
            return mixStack.filter(\.visible).reduce(input) { partial, layer in
                apply(effectID: layer.effectId, parameters: layer.params, to: partial).cropped(to: partial.extent)
            }
        }

        guard let effect else {
            return input
        }

        return apply(effectID: effect.effectId, parameters: effect.params, to: input).cropped(to: input.extent)
    }

    private func apply(effectID: String, parameters: [String: EffectValue], to image: CIImage) -> CIImage {
        switch effectID {
        case "pixelate":
            return image.applyingFilter("CIPixellate", parameters: [
                kCIInputScaleKey: number(parameters, "cellSize", default: 10),
            ])
        case "crystallize":
            return image.applyingFilter("CICrystallize", parameters: [
                kCIInputRadiusKey: max(2, number(parameters, "cellCount", default: 100) / 8),
            ])
        case "halftone":
            return image.applyingFilter("CIDotScreen", parameters: [
                kCIInputWidthKey: number(parameters, "dotSize", default: 8),
                kCIInputAngleKey: radians(number(parameters, "angle", default: 45)),
            ])
        case "pointillize":
            return image.applyingFilter("CIPointillize", parameters: [
                kCIInputRadiusKey: number(parameters, "dotSize", default: 8),
            ])
        case "kaleidoscope":
            return image.applyingFilter("CIKaleidoscope", parameters: [
                "inputCount": Int(number(parameters, "segments", default: 6)),
                kCIInputAngleKey: radians(number(parameters, "angle", default: 0)),
            ])
        case "mirror":
            return mirroredImage(image, axis: text(parameters, "axis", default: "Horizontal"))
        case "tile":
            return tiledImage(image, scale: 1 / max(1, number(parameters, "tileCount", default: 2)))
        case "wave", "ocean-ripple":
            return image.applyingFilter("CITwirlDistortion", parameters: [
                kCIInputAngleKey: radians(number(parameters, "phase", default: 20)),
                kCIInputRadiusKey: max(image.extent.width, image.extent.height) * 0.45,
            ])
        case "twirl":
            return image.applyingFilter("CITwirlDistortion", parameters: [
                kCIInputAngleKey: radians(number(parameters, "angle", default: 90)),
                kCIInputRadiusKey: max(image.extent.width, image.extent.height) * CGFloat(number(parameters, "radius", default: 0.5)),
            ])
        case "bulge", "liquify":
            return image.applyingFilter("CIBumpDistortion", parameters: [
                kCIInputScaleKey: number(parameters, "strength", default: 0.5),
                kCIInputRadiusKey: max(image.extent.width, image.extent.height) * 0.35,
            ])
        case "pinch":
            return image.applyingFilter("CIPinchDistortion", parameters: [
                kCIInputScaleKey: number(parameters, "strength", default: 0.5),
                kCIInputRadiusKey: max(image.extent.width, image.extent.height) * 0.45,
            ])
        case "shear":
            let angle = radians(number(parameters, "angle", default: 12))
            let transform = CGAffineTransform(a: 1, b: 0, c: tan(angle), d: 1, tx: 0, ty: 0)
            return image.transformed(by: transform).cropped(to: image.extent)
        case "noise-displace":
            return displaced(image, amount: number(parameters, "amount", default: 20))
        case "rgb-split":
            return rgbSplit(image, offset: number(parameters, "offset", default: 12))
        case "scanlines":
            return blendOverlay(
                image,
                overlay: CIFilter.stripesGenerator().outputImage?
                    .cropped(to: image.extent)
                    .applyingFilter("CIColorMatrix", parameters: [
                        "inputRVector": CIVector(x: 0, y: 0, z: 0, w: 0),
                        "inputGVector": CIVector(x: 0, y: 0, z: 0, w: 0),
                        "inputBVector": CIVector(x: 0, y: 0, z: 0, w: 0),
                        "inputAVector": CIVector(x: 0, y: 0, z: 0, w: max(0.05, number(parameters, "opacity", default: 0.4))),
                    ]),
                mode: "CIMultiplyCompositing"
            )
        case "glitch-rows":
            return image.applyingFilter("CIEdgeWork", parameters: [kCIInputRadiusKey: 2])
                .applyingFilter("CIColorPosterize", parameters: ["inputLevels": 6])
                .composited(over: image)
        case "emboss":
            return image.applyingFilter("CIConvolution3X3", parameters: [
                "inputWeights": CIVector(values: [-2, -1, 0, -1, 1, 1, 0, 1, 2], count: 9),
                "inputBias": 0.5,
            ])
        case "bevel":
            return image.applyingFilter("CIShadedMaterial", parameters: [
                "inputScale": max(1, number(parameters, "height", default: 8)),
            ])
        case "find-edges", "accented-edges":
            return image.applyingFilter("CIEdges", parameters: [
                kCIInputIntensityKey: number(parameters, "intensity", default: 4),
            ])
        case "oil-paint":
            return image
                .applyingFilter("CIMedianFilter")
                .applyingFilter("CIColorPosterize", parameters: ["inputLevels": max(4, number(parameters, "detail", default: 8))])
        case "watercolor":
            return blendOverlay(
                image.applyingFilter("CINoiseReduction", parameters: [
                    "inputNoiseLevel": 0.02,
                    "inputSharpness": 0.2,
                ]),
                overlay: image.applyingFilter("CILineOverlay", parameters: [
                    "inputNRNoiseLevel": 0.02,
                    "inputEdgeIntensity": 0.6,
                ]),
                mode: "CIOverlayBlendMode"
            )
        case "posterize":
            return image.applyingFilter("CIColorPosterize", parameters: [
                "inputLevels": max(2, number(parameters, "levels", default: 6)),
            ])
        case "poster-edges":
            return blendOverlay(
                image.applyingFilter("CIColorPosterize", parameters: ["inputLevels": 6]),
                overlay: image.applyingFilter("CIEdges", parameters: [kCIInputIntensityKey: 3]),
                mode: "CIMultiplyCompositing"
            )
        case "gaussian-blur":
            return image.applyingFilter("CIGaussianBlur", parameters: [
                kCIInputRadiusKey: number(parameters, "radius", default: 8),
            ]).cropped(to: image.extent)
        case "motion-blur":
            return image.applyingFilter("CIMotionBlur", parameters: [
                kCIInputRadiusKey: number(parameters, "radius", default: 12),
                kCIInputAngleKey: radians(number(parameters, "angle", default: 0)),
            ]).cropped(to: image.extent)
        case "surface-blur":
            return image.applyingFilter("CINoiseReduction", parameters: [
                "inputNoiseLevel": min(0.1, number(parameters, "radius", default: 6) / 100),
                "inputSharpness": max(0.1, 1 - number(parameters, "threshold", default: 0.4)),
            ])
        case "unsharp-mask":
            return image.applyingFilter("CIUnsharpMask", parameters: [
                kCIInputRadiusKey: number(parameters, "radius", default: 3),
                kCIInputIntensityKey: number(parameters, "amount", default: 1),
            ])
        case "cross-hatch", "ink-outlines":
            return image.applyingFilter("CILineOverlay", parameters: [
                "inputNRNoiseLevel": 0.02,
                "inputEdgeIntensity": max(0.4, number(parameters, "intensity", default: 1)),
            ])
        case "spatter":
            return blendOverlay(image, overlay: randomNoise(color: UIColor.white, alpha: 0.18, extent: image.extent), mode: "CIOverlayBlendMode")
        case "sumi-e":
            return image.applyingFilter("CIPhotoEffectNoir")
                .applyingFilter("CILineOverlay", parameters: ["inputEdgeIntensity": 0.8])
        case "plastic-wrap":
            return image.applyingFilter("CIBloom", parameters: [
                kCIInputRadiusKey: 8,
                kCIInputIntensityKey: 0.7,
            ])
        case "clouds-fibers", "render-clouds":
            return blendOverlay(image, overlay: randomNoise(color: UIColor.white, alpha: 0.22, extent: image.extent), mode: "CISoftLightBlendMode")
        case "liquid-glass", "glassmorphism":
            return image.applyingFilter("CIGlassDistortion", parameters: [
                "inputScale": max(60, number(parameters, "distortion", default: 120)),
            ])
        case "frosted-glass":
            return image.applyingFilter("CIGlassLozenge", parameters: [
                "inputRadius": max(10, number(parameters, "blur", default: 24)),
                "inputRefraction": max(1.0, number(parameters, "refraction", default: 1.4)),
            ])
        case "zigzag":
            return image.applyingFilter("CITorusLensDistortion", parameters: [
                "inputRadius": max(image.extent.width, image.extent.height) * 0.3,
                "inputWidth": max(20, number(parameters, "ridges", default: 40)),
                "inputRefraction": max(1.0, number(parameters, "magnitude", default: 1.5)),
            ])
        case "high-pass":
            return blendOverlay(image, overlay: image.applyingFilter("CIEdges", parameters: [kCIInputIntensityKey: 5]), mode: "CIAdditionCompositing")
        case "low-pass":
            return image.applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 12]).cropped(to: image.extent)
        case "gradient-filter":
            return blendOverlay(image, overlay: gradientOverlay(extent: image.extent), mode: "CISoftLightBlendMode")
        case "fourier-mask":
            return image.applyingFilter("CIPixellate", parameters: [kCIInputScaleKey: 18]).applyingFilter("CIColorInvert")
        case "blue-mosaic":
            return tint(image.applyingFilter("CIPixellate", parameters: [kCIInputScaleKey: 10]), color: UIColor(red: 0.28, green: 0.54, blue: 0.95, alpha: 1), intensity: 0.4)
        case "aurora-borealis":
            return blendOverlay(image, overlay: auroraOverlay(extent: image.extent), mode: "CIScreenBlendMode")
        case "energy-field":
            return blendOverlay(image, overlay: radialGlow(extent: image.extent, color: UIColor.systemTeal), mode: "CIScreenBlendMode")
        case "flame-render":
            return blendOverlay(image, overlay: radialGlow(extent: image.extent, color: UIColor.systemOrange), mode: "CIAdditionCompositing")
        case "nebula-render":
            return blendOverlay(image, overlay: tint(randomNoise(color: UIColor.systemPurple, alpha: 0.35, extent: image.extent), color: UIColor.systemPurple, intensity: 0.6), mode: "CIScreenBlendMode")
        case "plasma-wave":
            return blendOverlay(image, overlay: gradientOverlay(extent: image.extent).applyingFilter("CITwirlDistortion", parameters: [kCIInputAngleKey: 2.4]), mode: "CIColorDodgeBlendMode")
        case "lightning-storm":
            return blendOverlay(image, overlay: lightningOverlay(extent: image.extent), mode: "CIScreenBlendMode")
        default:
            return image
        }
    }

    private func number(_ params: [String: EffectValue], _ key: String, default defaultValue: Double) -> Double {
        params[key]?.numberValue ?? defaultValue
    }

    private func text(_ params: [String: EffectValue], _ key: String, default defaultValue: String) -> String {
        params[key]?.stringValue ?? defaultValue
    }

    private func radians(_ degrees: Double) -> Double {
        degrees * .pi / 180
    }

    private func makeUIImage(from image: CIImage) -> UIImage? {
        guard let cgImage = context.createCGImage(image, from: image.extent.integral) else { return nil }
        return UIImage(cgImage: cgImage)
    }

    private func resize(_ image: CIImage, toFit size: CGSize) -> CIImage {
        let imageSize = image.extent.size
        guard imageSize.width > 0, imageSize.height > 0 else { return image }
        let scale = min(size.width / imageSize.width, size.height / imageSize.height)
        return image.transformed(by: .init(scaleX: scale, y: scale))
    }

    private func blendOverlay(_ image: CIImage, overlay: CIImage?, mode: String) -> CIImage {
        guard let overlay else { return image }
        return overlay.applyingFilter(mode, parameters: [kCIInputBackgroundImageKey: image]).cropped(to: image.extent)
    }

    private func randomNoise(color: UIColor, alpha: CGFloat, extent: CGRect) -> CIImage {
        let noise = CIFilter.randomGenerator().outputImage ?? CIImage.empty()
        let tinted = noise.applyingFilter("CIFalseColor", parameters: [
            "inputColor0": CIColor(color: .clear),
            "inputColor1": CIColor(color: color.withAlphaComponent(alpha)),
        ])
        return tinted.cropped(to: extent)
    }

    private func gradientOverlay(extent: CGRect) -> CIImage {
        let filter = CIFilter.linearGradient()
        filter.point0 = CGPoint(x: extent.minX, y: extent.minY)
        filter.point1 = CGPoint(x: extent.maxX, y: extent.maxY)
        filter.color0 = CIColor(color: UIColor(red: 0.83, green: 0.68, blue: 0.22, alpha: 0.55))
        filter.color1 = CIColor(color: UIColor(red: 0.04, green: 0.52, blue: 1.0, alpha: 0.35))
        return (filter.outputImage ?? CIImage.empty()).cropped(to: extent)
    }

    private func radialGlow(extent: CGRect, color: UIColor) -> CIImage {
        let filter = CIFilter.radialGradient()
        filter.center = CGPoint(x: extent.midX, y: extent.midY)
        filter.radius0 = 12
        filter.radius1 = Float(max(extent.width, extent.height) * 0.45)
        filter.color0 = CIColor(color: color.withAlphaComponent(0.75))
        filter.color1 = CIColor(color: .clear)
        return (filter.outputImage ?? CIImage.empty()).cropped(to: extent)
    }

    private func auroraOverlay(extent: CGRect) -> CIImage {
        let base = gradientOverlay(extent: extent)
        return tint(base.applyingFilter("CITwirlDistortion", parameters: [
            kCIInputAngleKey: 1.4,
            kCIInputRadiusKey: max(extent.width, extent.height) * 0.55,
        ]), color: UIColor.systemGreen, intensity: 0.45)
    }

    private func lightningOverlay(extent: CGRect) -> CIImage {
        let stripes = CIFilter.stripesGenerator()
        stripes.width = 12
        stripes.sharpness = 0.95
        stripes.color0 = CIColor(color: UIColor.white.withAlphaComponent(0.8))
        stripes.color1 = CIColor(color: .clear)
        let image = (stripes.outputImage ?? CIImage.empty())
            .cropped(to: extent)
            .transformed(by: .init(rotationAngle: -.pi / 3))
            .applyingFilter("CIBloom", parameters: [kCIInputRadiusKey: 10, kCIInputIntensityKey: 1.0])
        return image
    }

    private func tint(_ image: CIImage, color: UIColor, intensity: CGFloat) -> CIImage {
        let matrix = CIFilter.colorMatrix()
        matrix.inputImage = image
        matrix.rVector = CIVector(x: intensity, y: 0, z: 0, w: 0)
        matrix.gVector = CIVector(x: 0, y: intensity, z: 0, w: 0)
        matrix.bVector = CIVector(x: 0, y: 0, z: intensity, w: 0)
        matrix.aVector = CIVector(x: 0, y: 0, z: 0, w: 1)
        let monochrome = matrix.outputImage ?? image
        return monochrome.applyingFilter("CIColorMonochrome", parameters: [
            kCIInputColorKey: CIColor(color: color),
            kCIInputIntensityKey: intensity,
        ])
    }

    private func displaced(_ image: CIImage, amount: Double) -> CIImage {
        let displacement = randomNoise(color: .white, alpha: 1, extent: image.extent)
        return image.applyingFilter("CIDisplacementDistortion", parameters: [
            "inputDisplacementImage": displacement,
            kCIInputScaleKey: amount,
        ]).cropped(to: image.extent)
    }

    private func mirroredImage(_ image: CIImage, axis: String) -> CIImage {
        let center = CGPoint(x: image.extent.midX, y: image.extent.midY)
        let transform: CGAffineTransform
        switch axis.lowercased() {
        case "vertical":
            transform = CGAffineTransform(translationX: image.extent.maxX, y: 0).scaledBy(x: -1, y: 1)
        case "both":
            transform = CGAffineTransform(translationX: image.extent.maxX, y: image.extent.maxY).scaledBy(x: -1, y: -1)
        case "diagonal":
            transform = CGAffineTransform(translationX: center.x, y: center.y).rotated(by: .pi / 2)
        default:
            transform = CGAffineTransform(translationX: 0, y: image.extent.maxY).scaledBy(x: 1, y: -1)
        }
        return image.transformed(by: transform).cropped(to: image.extent)
    }

    private func tiledImage(_ image: CIImage, scale: Double) -> CIImage {
        let transformed = image.transformed(by: .init(scaleX: scale, y: scale))
        return transformed.applyingFilter("CIAffineTile").cropped(to: image.extent)
    }

    private func rgbSplit(_ image: CIImage, offset: Double) -> CIImage {
        let red = image
            .transformed(by: .init(translationX: CGFloat(-offset), y: 0))
            .applyingFilter("CIColorMatrix", parameters: [
                "inputRVector": CIVector(x: 1, y: 0, z: 0, w: 0),
                "inputGVector": CIVector(x: 0, y: 0, z: 0, w: 0),
                "inputBVector": CIVector(x: 0, y: 0, z: 0, w: 0),
                "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 1),
            ])

        let green = image.applyingFilter("CIColorMatrix", parameters: [
            "inputRVector": CIVector(x: 0, y: 0, z: 0, w: 0),
            "inputGVector": CIVector(x: 0, y: 1, z: 0, w: 0),
            "inputBVector": CIVector(x: 0, y: 0, z: 0, w: 0),
            "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 1),
        ])

        let blue = image
            .transformed(by: .init(translationX: CGFloat(offset), y: 0))
            .applyingFilter("CIColorMatrix", parameters: [
                "inputRVector": CIVector(x: 0, y: 0, z: 0, w: 0),
                "inputGVector": CIVector(x: 0, y: 0, z: 0, w: 0),
                "inputBVector": CIVector(x: 0, y: 0, z: 1, w: 0),
                "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 1),
            ])

        return blendOverlay(blendOverlay(red, overlay: green, mode: "CIAdditionCompositing"), overlay: blue, mode: "CIAdditionCompositing")
    }
}

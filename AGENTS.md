# Corivo engineering guide for agents

This file applies to the entire repository. A more deeply nested `AGENTS.md`, if one is added later, overrides this file only for its subtree.

Corivo is an offline-first photo-effects editor with two implementations in one repository:

- The root project is the active React Native application for iOS and Android.
- `Swift_version/` is a separate native SwiftUI iOS implementation with its own Xcode project, persistence layer, renderer, tests, and one-time migration path from the React Native app's local data.

The executable code and checked-in configuration are authoritative. `README.md` still contains substantial older product language about photo annotation, Pro/IAP tiers, 4K export, and scripts that do not all exist. Use it for historical intent, not as a runtime specification.

## Agent operating rules

1. Determine which implementation the request targets before editing. Root React Native work does not automatically authorize changes in `Swift_version/`, and SwiftUI work does not automatically authorize root-app changes. When parity is part of the request, update both deliberately.
2. Inspect `git status --short --untracked-files=all` before editing. The worktree is often dirty and may be shared with another task. Preserve all unrelated modifications and untracked files.
3. Prefer the codebase knowledge graph for code discovery, then inspect exact source. Use text search primarily for literals, config, assets, generated data, or when the graph is incomplete.
4. Treat `src/domain/effects/registry.ts` and `src/localization/languages/*.ts` as sources for generated Swift metadata. Never hand-edit `Swift_version/Corivo/Resources/Generated/*.json` as the only change.
5. Do not edit build products or dependency directories: `.derived/`, `DerivedData/`, `ios/Pods/`, `node_modules/`, `android/build/`, `android/app/build/`, `.gradle/`, or generated app bundles.
6. Keep the product offline-first. Do not add uploads, analytics, remote APIs, tracking, or cloud persistence without explicit product authorization.
7. For behavior changes, add or update the smallest meaningful tests and run checks proportional to the touched surface. Rendering changes also require simulator/device inspection; unit tests alone are not sufficient for Skia or Core Image output.
8. Do not mass-format the repository. Apply formatting only to files in scope.
9. Avoid destructive storage recovery during normal development. In particular, `ProjectDatabase.forceReinitialize()` can clear the whole AsyncStorage namespace.
10. When documentation and code disagree, report the disagreement and follow current code unless the task explicitly changes the product contract.

## Code discovery policy

<!-- codebase-memory-mcp:start -->
This project uses codebase-memory-mcp to maintain a knowledge graph of the codebase. Always prefer graph tools over grep/glob/file search for code discovery.

Priority order:

1. `search_graph` — find functions, classes, routes, variables, and concepts.
2. `trace_path` — find callers, callees, impact, and data flow.
3. `get_code_snippet` — read an exact symbol after locating its qualified name.
4. `query_graph` — inspect complex patterns, files, or relationships.
5. `get_architecture` — get a high-level summary, boundaries, hotspots, and clusters.
6. `search_code` — graph-augmented text search.

The indexed project name is normally `Users-antonchepur-Corivo`. If it is missing or stale, run `index_repository` for `/Users/antonchepur/Corivo` before relying on graph results.

Fall back to `rg` for:

- String literals, error messages, config values, and asset references.
- Markdown, JSON, plist, Gradle, Ruby, shell, Xcode project, and other non-code files.
- Tests or assets excluded by the graph index.
- A graph result that is demonstrably incomplete.
<!-- codebase-memory-mcp:end -->

## Product description and current concept

The current application lets a user select a local photo, apply image effects, save editable project metadata locally, revisit projects, and export or share a rendered image. There is no application server and no account model.

The current user journey is:

```text
launch
  -> 2.8-second splash and persisted-store hydration
  -> first-run onboarding, if needed
  -> radial home
       -> choose photo -> single-effect editor -> export/share
       -> recent projects -> reopen single-effect editor or mix editor
       -> mixes -> choose photo and stack up to four shader-backed effects
       -> settings
       -> about
```

Current product capabilities visible in code:

- 52 registered effects across 12 categories.
- A single-effect editor with parameter controls, pinch zoom, effect-specific dragging for lightning, undo/redo history, reset, project autosave on exit, and export.
- A separate Mixes workflow that can nest up to four effects that have a `shaderPath`.
- Local project thumbnails, rename, duplicate, delete, sort, and reopen behavior.
- Export to Photos, Files, the platform share sheet, Instagram, and X.
- Four themes: dark, light, solar, and mono.
- 30 languages in the TypeScript localization catalog.
- Haptic feedback and Reduce Motion handling in selected surfaces.
- A local re-engagement notification scheduled after 21 days of inactivity when OS permission is already granted.

Important product truth:

- Although the model contains `isPremium`/`isPro` fields, the current generated effect catalog marks all 52 effects as free and there is no active entitlement or IAP system in the root app.
- The active export implementation renders PNG with a maximum dimension of 1080 pixels. It does not currently honor the saved `defaultExportFormat` or `defaultExportQuality` preferences. Some onboarding and README copy says 4K; that is not the present renderer behavior.
- The active app is an effects editor, not the annotation editor described in older README sections. Text, sticker, watermark, and stamp editing are not implemented in the current root runtime.

## Repository topology

```text
Corivo/
├── index.js                         React Native registration entry
├── App.tsx                          Root providers and app navigator
├── src/                             Active React Native application
│   ├── assets/                      Icons, flags, masks, images, and .sksl files
│   ├── components/                  Reusable controls, project rows, menus, renderers
│   ├── constants/                   Design tokens and themes
│   ├── database/                    AsyncStorage project persistence
│   ├── domain/                      Effect catalog, shaders, and image-processing code
│   ├── hooks/                       Theme and localization selectors
│   ├── localization/                Translation contract and 30 language objects
│   ├── navigation/                  Native-stack route contract
│   ├── screens/                     App screens and feature orchestration
│   ├── services/                    Native-service facades such as local notifications
│   ├── stores/                      Zustand state stores
│   ├── types/                       Shared TypeScript data contracts
│   └── utils/                       Haptics, logging, animation, and URI helpers
├── __tests__/                       Root React Native smoke tests
├── ios/                             React Native iOS host and CocoaPods workspace
├── android/                         React Native Android host and Gradle project
├── Swift_version/                   Independent SwiftUI iOS application
│   ├── Corivo.xcodeproj/            Native Xcode project
│   ├── Corivo/App/                  Native app entry and application model
│   ├── Corivo/Core/                 Assets, localization, haptics, design system
│   ├── Corivo/Data/                 Models, catalog, rendering, persistence, migration
│   ├── Corivo/Features/             SwiftUI feature views
│   ├── Corivo/Resources/Generated/  Derived effects/translations JSON
│   ├── Corivo/Tests/                Native migration and persistence tests
│   └── Tools/                       React Native -> Swift metadata exporter
├── package.json                     Yarn scripts and JS/native dependencies
├── Gemfile                          CocoaPods toolchain constraints
├── babel.config.js                  React Native preset; Reanimated plugin last
├── metro.config.js                  Metro defaults, currently no aliases
├── tsconfig.json                    React Native TypeScript base config
├── jest.config.js                   React Native Jest preset
├── .eslintrc.js                     React Native ESLint preset
└── .prettierrc.js                   Single quotes, trailing commas, no parens for one arg
```

`src/assets/` and test directories can be excluded from a moderate knowledge-graph index. Their absence from graph output does not mean they are absent from the application.

## Source-of-truth hierarchy

For behavior and implementation decisions, use this order:

1. The current user request and any scoped instructions.
2. Executable source and native configuration.
3. Tests that reflect the current product contract.
4. Type definitions and generated metadata.
5. `README.md` and historical comments.

Generated Swift JSON is derived, not primary. Tests can also lag the product: for example, older color-filter tests may assert a free/premium split that no longer matches `filters.ts`. Do not change working behavior merely to satisfy stale assertions without confirming the intended product contract.

## React Native runtime architecture

### Boot sequence

```text
index.js
  -> AppRegistry.registerComponent("Corivo")
  -> App.tsx
       -> GestureHandlerRootView
       -> SafeAreaProvider
       -> StatusBar from persisted theme
       -> AppNavigator
            -> wait for Zustand app-store hydration
            -> show CorivoSplashScreen for about 2.8 seconds
            -> detect device language before first onboarding
            -> Onboarding or Home
```

Key boot files:

- `index.js` registers `App` using the name from `app.json`.
- `App.tsx` installs gesture and safe-area roots and selects status-bar colors from `useAppStore`.
- `src/navigation/AppNavigator.tsx` gates rendering on persisted-store hydration and splash duration.
- `src/stores/appStore.ts` owns onboarding and preferences and detects the device language.
- `src/services/notifications.ts` is wired to `AppState`: foregrounding cancels the pending inactivity reminder and backgrounding schedules a new one when permission exists.

Do not remove the hydration gate casually. Rendering navigation before `useAppStore.persist` hydrates can briefly show onboarding or the wrong language/theme.

### Navigation contract

`src/navigation/AppNavigator.tsx` defines `RootStackParamList` and is the route source of truth.

| Route | Screen | Parameters and behavior |
| --- | --- | --- |
| `Onboarding` | `OnboardingScreen` | No params; conditionally registered until onboarding is complete. Gestures cannot dismiss it. |
| `Home` | `LiquidRadialHomeScreen` | Active home. Do not confuse with the older `HomeScreen.tsx`. |
| `Editor` | `EffectsEditorScreen` | `{ imageUri?: string; projectId?: string }`; new photo or persisted single-effect project. |
| `Export` | `ExportScreen` | `{ imageUri: string; effectId?: string; params?: Record<string, any> }`. |
| `RecentProjects` | `RecentProjectsScreen` | Modal project browser. |
| `Mixes` | `MixesScreen` | Optional `{ imageUri?, projectId? }`; multi-effect workflow. |
| `Settings` | `SettingsScreen` | Modal settings UI. |
| `About` | `AboutScreen` | Modal product information. |
| `ImagePicker` | `ImagePickerScreen` | Registered custom photo grid, but not the main home selection path. |

The active home calls `react-native-image-picker` directly and navigates to `Editor`. `ImagePickerScreen` uses CameraRoll and fallback photos and is an alternate/legacy path. When changing photo selection, identify which path the request concerns.

Avoid `as never` and `as any` in new navigation code. Prefer typed navigation derived from `RootStackParamList`, and update the param list whenever a route payload changes.

### Active screen ownership

- `src/screens/LiquidRadialHomeScreen.tsx` is the active home and owns entry actions for photo selection, recents, mixes, settings, and about.
- `src/components/LiquidMenu/LiquidMenu.tsx` renders the animated radial control. It supports up to eight hard-coded satellite animation slots and honors the system Reduce Motion preference.
- `src/screens/EffectsEditorScreen.tsx` orchestrates the single-effect editing session.
- `src/screens/MixesScreen.tsx` owns its own local `mixStack`; it does not use the Zustand effect stack.
- `src/screens/RecentProjectsScreen.tsx` reloads projects on focus and decides which editor to open.
- `src/screens/ExportScreen.tsx` re-renders one effect on a high-resolution Skia canvas and owns all share/save actions.
- `src/screens/SettingsScreen.tsx` owns theme, language, haptics, delete confirmation, and onboarding reset UI. Several maintenance actions remain placeholders.
- `src/services/notifications.ts` owns notification permission checks, the Android channel, reminder messages, scheduling, cancellation, and the settings retry path.
- `src/screens/HomeScreen.tsx` is an older project-gallery home and is not registered in the active navigator.

## State and persistence

There are three Zustand stores, but they have intentionally different persistence behavior.

### `useAppStore` — preferences and onboarding

File: `src/stores/appStore.ts`

- Persist key: `app-storage`.
- Preferred backend: MMKV instance with id `app-storage`.
- Fallback backend: AsyncStorage if MMKV construction fails.
- Persisted state includes `hasSeenOnboarding`, `_languageVersion`, and `preferences`.
- Preferences currently include export defaults, autosave, haptics, color scheme, theme, sound, delete confirmation, and language.
- `_languageVersion` exists to force subscribers to refresh after a language mutation.
- Device-language mapping converts `tl` to `fil` and otherwise falls back to English for unsupported codes.

Not every preference is wired to behavior. In particular, export format/quality, sound, and autosave should not be assumed functional just because they are persisted.

### `useEffectsStore` — editor session and presets

File: `src/stores/effectsStore.ts`

- Persist key/MMKV id: `effects-store`.
- Persist middleware deliberately partializes state to `presets` only.
- `effectStack`, current layer, history, and parameter cache are session state.
- `isStackMode` defaults to `false`; `addEffect` therefore replaces the active layer in the normal editor.
- Slider movement uses `updateEffectParamsNoHistory`; gesture/slider completion calls `commitEffectParamsToHistory`. This prevents one history entry per animation frame.
- Parameter cache remembers recent values only for the current session and is cleared when a new image/project is loaded.
- If MMKV is unavailable, its adapter becomes a no-op/in-memory behavior; do not assume preset durability in that failure mode.

The data structure supports multiple layers, opacity, visibility, blend mode, and reordering, but the active single-effect editor renders and saves only the last/current effect. Do not infer that it is already a multi-layer editor.

### `useProjectGalleryStore` — in-memory project facade

File: `src/stores/projectGalleryStore.ts`

- Not persisted through Zustand.
- Loads authoritative data from `ProjectDatabase`.
- Owns list loading state, selection mode, selected IDs, sort order, rename, duplicate, and delete flows.
- Screens should call `loadProjects()` after writes that need to appear immediately.

### `ProjectDatabase` — React Native project storage

Files: `src/database/ProjectDatabase.ts` and `src/types/index.ts`

- Backend: AsyncStorage.
- Project key prefix: `corivo_project_`.
- Metadata key: `corivo_project_ids`.
- Each project is stored as a JSON object under its own key; the metadata key stores the project ID list.
- `getById` converts serialized `createdAt` and `updatedAt` strings back to `Date` objects.
- `getAll` reads every ID, loads each project, and sorts by `updatedAt` descending.
- Export/import methods serialize project metadata; they do not package original photos and thumbnail files into a portable archive.

Project shape:

```ts
interface Project {
  id: string;
  name?: string;
  sourceImagePath: string;
  sourceImageDimensions: { width: number; height: number };
  thumbnailPath: string;
  effect?: { effectId: string; params: Record<string, any> };
  mixStack?: EffectLayer[];
  elements?: unknown[]; // legacy compatibility
  createdAt: Date;
  updatedAt: Date;
}
```

Project classification is structural:

- If `Array.isArray(project.mixStack)` is true, Recent Projects opens `Mixes`, even for an empty array.
- Otherwise it opens the single-effect `Editor`.
- A single-effect save writes `project.effect`.
- A mix save writes `project.mixStack`.

Preserve these semantics when evolving the schema. A schema change generally requires updates to TypeScript types, save/load code, both editors, Recent Projects routing, duplicate/import behavior, Swift models, migration mapping, and persistence tests.

### Filesystem-backed images

- Thumbnails are captured from Skia canvases and written under `RNFS.DocumentDirectoryPath/thumbnails`.
- Export temporaries are written under `RNFS.CachesDirectoryPath/exports` and normally unlinked after sharing/saving.
- Source paths can be `ph://`, `file://`, absolute filesystem paths, or other image-picker URIs.
- `src/utils/imageUtils.ts` can copy `ph://` photos to cache, but the active editor currently tries supported URIs directly.
- Project deletion removes metadata but does not currently garbage-collect associated thumbnail files.

## Effects and rendering architecture

### Effect metadata

Files:

- `src/domain/effects/types.ts` — categories, effect/parameter contracts, layers, blend modes, and presets.
- `src/domain/effects/registry.ts` — the 52-effect catalog, icons, parameters, defaults, complexity metadata, premium flag, and optional `shaderPath`.
- `src/domain/effects/filters.ts` — a separate 20-value ColorMatrix filter catalog.

The registered categories are:

- cellular
- tiling
- distortion
- relief
- glitch
- stylization
- blur/sharpen
- brush
- glass
- correction
- frequency
- render

Effect IDs are durable identifiers. They are stored in projects, presets, translations, generated Swift JSON, and renderer switch statements. Renaming an ID is a data migration, not a cosmetic refactor.

Parameter names are also cross-layer contracts. A name must match:

- The registry definition.
- The editor control.
- The renderer's `params` lookup.
- Shader uniform names, where relevant.
- Translation keys.
- Swift generated metadata and Core Image parameter mapping if parity is required.

### Single-effect render path

```text
registry Effect + current params
  -> EffectsEditorScreen
  -> EffectRenderer useMemo
       -> inline effect-specific SkSL, or
       -> ShaderManager.loadShader(shaderPath)
  -> Skia RuntimeEffect + uniforms
  -> ImageShader child
  -> Canvas preview / thumbnail / ExportScreen re-render
```

`src/components/effects/EffectRenderer.tsx` is the main React Native render hotspot and is intentionally large. It maps effect IDs to SkSL implementations, compiles runtime effects, builds uniforms, and handles lightning mask images. Compilation or mapping failure falls back to the original image.

Keep compilation inside memoized/cached paths. Do not compile a RuntimeEffect on every slider frame without a strong reason.

### Shader source truth

There are three shader-looking locations, and they are not equivalent:

1. Many effect implementations are inline strings inside `EffectRenderer.tsx`.
2. `src/domain/shader-manager/ShaderManager.ts` contains an inline `SHADER_SOURCES` map and an in-memory compiled shader cache.
3. `src/assets/shaders/**/*.sksl` contains standalone shader files.

The current runtime does not read `.sksl` files from disk. Editing a file under `src/assets/shaders/` alone may have no effect. For a `shaderPath` effect, the path must exist in `ShaderManager`'s inline `SHADER_SOURCES` map. For an inline-renderer effect, its switch case in `EffectRenderer` is authoritative.

`ShaderManager.preloadShaders()` defines a common subset but is not currently part of the main boot trace. Do not assume all shaders are eagerly validated.

### Mixes render path

`src/screens/MixesScreen.tsx` is separate from the single-effect editor:

- It filters the registry to effects with `shaderPath`.
- It caps the stack at `MAX_STACK = 4`.
- It builds defaults from the registry.
- It introspects each compiled runtime effect's uniforms and creates a uniform map.
- It nests `<Shader>` nodes around an `ImageShader` in stack order.
- It currently lets users add/remove/reorder/toggle visibility, but it does not expose parameter, opacity, or blend-mode editors.
- Although layers store opacity and blend mode, the current nested renderer does not apply those fields.

An effect implemented only as an inline `EffectRenderer` switch case is not automatically available in Mixes. Adding `shaderPath` is not enough unless `ShaderManager.loadShader()` can resolve and compile it and `buildUniformMap()` can supply every required uniform correctly.

### Alternate rendering code

- `src/domain/image-processor/ImageProcessor.ts` implements offscreen Skia surface rendering, stacks, export, uniform normalization, and adaptive-quality logic. The code graph currently shows no production callers.
- `src/components/effects/FilterRenderer.tsx` renders ColorMatrix filters. It is not in the active editor/export call chain.
- `src/domain/effects/filters.ts` and its tests therefore describe an alternate/older filter surface, not the main 52-effect editor.

Do not route new behavior through these files without first confirming that the task intends to activate that alternate path.

### Export path

`src/screens/ExportScreen.tsx`:

- Loads the source image again with Skia.
- Resolves one effect by ID from `EFFECTS`.
- Renders with `EffectRenderer` on a canvas whose longest side is `EXPORT_SIZE = 1080`.
- Captures a snapshot and encodes it as PNG base64.
- Writes a temporary `.png` under the cache directory.
- Saves to CameraRoll, opens the generic share sheet, saves to Files, or uses Instagram/X-specific sharing.
- Cleans up the temporary file on the normal path.

The screen does not currently export mix stacks, choose JPEG, apply a quality preference, or guarantee cleanup on every exceptional/cancel path. Change product copy and settings only when renderer behavior is changed with it.

### Adding or changing an effect

For a root-app effect change, check every applicable item:

1. Add or update metadata in `src/domain/effects/registry.ts`.
2. Keep the effect ID and parameter names stable or provide migration logic.
3. Add/update a static icon under `src/assets/icons/filters/` and use a static `require()` path.
4. Implement the effect in `EffectRenderer.tsx`, or add a resolvable source to `ShaderManager.ts` for a `shaderPath` effect.
5. Make string/boolean/array parameter conversion explicit. Shader integers must be rounded and option strings must map deterministically to numeric indices.
6. Add effect name, category, parameter, and option translations. Update the `Translations` interface if the key set changes.
7. If the effect should work in Mixes, validate `shaderPath`, all uniforms, nesting behavior, visibility, and stack order.
8. Regenerate Swift metadata with `node Swift_version/Tools/export_corivo_metadata.js`.
9. If native parity is required, update `Swift_version/Corivo/Data/RenderPipeline.swift`; generated metadata supplies definitions, not rendering behavior.
10. Test portrait and landscape images, min/default/max parameters, undo/redo, project reopen, thumbnail capture, export, and at least one physical device. Shader loop cost can differ dramatically from simulator behavior.

## Editor interaction and history contracts

The single-effect editor uses these patterns:

- Selecting an effect resolves cached parameters or builds defaults, then calls `addEffect`.
- Because stack mode is false, the new effect replaces the previous active effect.
- Continuous sliders update without history; release commits one snapshot.
- Undo/redo replaces the complete effect stack snapshot and synchronizes the selected category/effect.
- Pinch scales the preview container only.
- A pan gesture is enabled only for `lightning-storm`, updates its `position` parameter through `runOnJS`, and commits history at the end.
- Leaving or exporting always calls `saveProject()`; the persisted `autoSaveProjects` preference is not consulted.
- The thumbnail is a canvas snapshot, while the source image path and effect parameters remain the editable project payload.

When adding gestures, keep worklet boundaries valid. JavaScript state mutations from Reanimated handlers must cross through `runOnJS`; avoid capturing mutable React objects directly in UI-thread callbacks.

## Localization and theming

### Localization

Primary files:

- `src/localization/translations.ts` — `Language` union and `Translations` interface.
- `src/localization/index.ts` — imports language objects, exports the catalog and display names.
- `src/localization/languages/<code>.ts` — 30 language dictionaries.
- `src/hooks/useTranslation.ts` — selects the active language and supplies fallback objects for `home`, `liquidMenu`, `mixes`, and `recents`.
- `src/stores/appStore.ts` — persisted language selection and device-language mapping.
- `src/screens/SettingsScreen.tsx` — language list and flag mapping.

The 30 language codes are `ar`, `cs`, `da`, `de`, `el`, `en`, `es`, `fi`, `fil`, `fr`, `he`, `hi`, `hu`, `id`, `it`, `ja`, `ko`, `ms`, `nl`, `no`, `pl`, `pt`, `ro`, `ru`, `sv`, `th`, `tr`, `uk`, `vi`, and `zh`.

Localization changes have duplicated contracts. Keep all of these aligned:

- `Language` in `translations.ts`.
- `UserPreferences.language` in `src/types/index.ts`.
- Imports, `translations`, and `languageNames` in `src/localization/index.ts`.
- Device-language mapping in `appStore.ts`.
- Flag assets and `flagImages` in `SettingsScreen.tsx`.
- Every required translation object.
- Generated Swift `translations.json`.

Use `useTranslation()` in UI. Do not add new hard-coded user-facing English unless the surrounding surface is intentionally not localized and the task explicitly accepts that limitation.

The fallback sections in `useTranslation.ts` are compatibility aids, not a reason to leave new language files incomplete. English is the semantic source; translations should preserve placeholders such as `{count}` and keep identical object shape.

### Themes and design tokens

Primary files:

- `src/constants/themes.ts` — complete dark/light/solar/mono token sets.
- `src/constants/colors.ts`, `spacing.ts`, and `typography.ts` — legacy/shared design primitives.
- `src/hooks/useTheme.ts` — returns the persisted current theme.

Prefer theme/tokens over new literal colors and spacing values. Some existing screens, especially the editor and export screen, still hard-code dark colors; selecting a theme does not yet restyle every surface. If the task is theme consistency, audit the whole route rather than changing only Settings.

The visual language is dark-first with gold accent, large radial/organic controls, 8-point spacing intent, haptics, and motion. Maintain accessibility labels, touch targets, safe areas, contrast, and Reduce Motion behavior when modifying animated UI.

## Settings behavior

Currently functional:

- Theme selection.
- Language selection.
- Haptic preference storage and haptic gating in Settings.
- Delete-confirmation preference used by Recent Projects.
- Reset onboarding.
- Notification-permission status and a retry path when permission is denied.

Currently placeholder or only partially wired:

- Export all projects shows a not-yet-implemented alert.
- Clear cache confirms and reports success but does not invoke real cache cleanup.
- Delete all projects confirms and reports success but does not call `ProjectDatabase.clearAll()`.
- Export format and quality preferences exist but are not shown/applied by `ExportScreen`.
- Autosave and sound preferences exist in state but are not authoritative behavior switches.

Do not preserve placeholder alerts when implementing the real action. Connect them to the appropriate store/database/filesystem operation, reflect loading/error state, and add tests for the destructive confirmation boundary.

## Local inactivity notifications

File: `src/services/notifications.ts`

This is a local Notifee-based reminder, not a push-notification or server feature.

- Delay: exactly 21 days (`INACTIVITY_NOTIFICATION_DELAY_MS`).
- Notification ID: `creative-inactivity-reminder`, so only one pending inactivity reminder is managed.
- Android channel: `creative-reminders` with default importance.
- Content: one random entry from 50 checked-in English re-engagement messages plus a fixed English title.
- Permission: `AUTHORIZED` and `PROVISIONAL` count as granted.
- Scheduling first cancels the existing ID, then exits without scheduling if permission is unavailable.
- `AppNavigator` cancels the reminder on mount/foreground and schedules it when `AppState` becomes `background`.
- Settings does not represent an application preference toggle. The row appears only when permission is denied; enabling it requests permission, and a second denial opens system notification settings.
- The app does not automatically prompt at launch. A previously authorized user is scheduled silently on background; a denied user must opt into the retry from Settings.

When changing notifications:

1. Keep lifecycle ownership centralized; avoid registering duplicate `AppState` listeners in screens.
2. Preserve the fixed notification ID unless multiple concurrent reminders are an intentional product change.
3. Update Android `POST_NOTIFICATIONS` permission and native Notifee setup together with JS behavior.
4. Decide explicitly whether content should be localized. It is currently English-only even though the app supports 30 languages.
5. Handle native promise failures so background transitions do not create unhandled rejections.
6. Test authorized, provisional, denied, repeated backgrounding, foreground cancellation, settings retry, and exact timestamp behavior.
7. Do not describe this as push messaging: there is no device token, remote provider, or backend.

## Native SwiftUI implementation

`Swift_version/` is a real, separate Xcode project, not source compiled into the React Native workspace.

Current project facts:

- Xcode project: `Swift_version/Corivo.xcodeproj`.
- Scheme: `Corivo`.
- Targets: `Corivo` and `CorivoTests`.
- Swift language version: 5.0.
- iOS deployment target: 15.1.
- App bundle ID: `com.corivo.app`.
- Test bundle ID: `com.corivo.app.tests`.
- Device families: iPhone and iPad.

### Native architecture

```text
CorivoNativeApp
  -> AppModel (@MainActor ObservableObject)
       -> LocalizationManager
       -> EffectRegistry (generated effects.json)
       -> ProjectStore (Application Support JSON/files)
       -> RenderPipeline (Core Image)
       -> one-time MigrationCoordinator
  -> RootView
       -> SplashView
       -> OnboardingView
       -> HomeContainerView
            -> Home / editor / mixes / recents / settings / export sheets
```

Key native files:

- `Swift_version/Corivo/App/CorivoNativeApp.swift` — `@main` entry and environment object injection.
- `Swift_version/Corivo/App/AppModel.swift` — app-wide preferences, services, migration, theme, and localization facade.
- `Swift_version/Corivo/Features/RootView.swift` — splash/onboarding/home gate.
- `Swift_version/Corivo/Data/Models.swift` — Codable models mirroring the TypeScript product schema.
- `Swift_version/Corivo/Data/EffectRegistry.swift` — loads generated effect metadata.
- `Swift_version/Corivo/Data/RenderPipeline.swift` — Core Image implementations and composition helpers.
- `Swift_version/Corivo/Data/StoresAndMigration.swift` — `ProjectStore` plus React Native legacy-data migration.
- `Swift_version/Corivo/Core/Localization.swift` — generated translation lookup.
- `Swift_version/Corivo/Core/Assets.swift` — file, bundle, Photos, and legacy asset resolution.
- `Swift_version/Corivo/Core/DesignSystem.swift` — native themes and view modifiers.
- `Swift_version/Corivo/Features/*.swift` — native feature UI.

### Native persistence

`ProjectStore` writes under Application Support in `CorivoNative/`:

```text
CorivoNative/
├── projects.json
├── presets.json
├── thumbnails/
└── exports/
```

- Writes are atomic where possible.
- Dates in project JSON use ISO-8601.
- Project and preset arrays are loaded at store initialization.
- Projects sort newest first.
- Single-effect and mix records are explicit upsert paths.
- Export supports PNG and JPEG with quality clamped for JPEG.

### React Native to Swift migration

`MigrationCoordinator` runs once, guarded by `corivo.swift.migration.completed` in `UserDefaults`.

It looks for legacy values such as:

- `app-storage`
- `effects-store`
- `corivo_project_ids`
- `corivo_project_<id>`

It scans sandbox files and AsyncStorage-style manifests, parses embedded JSON, maps preferences/presets/projects, normalizes dates and effect values, rejects invalid paths, and imports the result into the native stores.

Migration changes are high risk. Preserve old key names, malformed-data tolerance, `ph://`/`asset://` handling, timestamp variants, and the one-time guard. Add fixtures to `MigrationTests.swift` for every newly supported legacy shape.

### Native rendering

The Swift renderer uses Core Image, not the React Native Skia source. Effect parity is semantic, not pixel-identical.

- `RenderPipeline.renderPreview` creates a `CIImage`, applies either a single effect or mix stack, optionally resizes, and returns a `UIImage`.
- `fullResolutionRender` uses the same mapping without preview resizing.
- `RenderPipeline.apply` maps durable effect IDs to Core Image filters and custom composition helpers.
- Missing/unsupported effect IDs fall back to the input image.

Changing the TypeScript registry or generated JSON does not implement the native visual effect. Update `RenderPipeline.swift` separately when native parity is required.

### Generated metadata bridge

Run:

```bash
node Swift_version/Tools/export_corivo_metadata.js
```

The script reads:

- `src/domain/effects/registry.ts`
- `src/localization/index.ts`
- `src/localization/languages/*.ts`

It writes:

- `Swift_version/Corivo/Resources/Generated/effects.json`
- `Swift_version/Corivo/Resources/Generated/translations.json`

Review the generated diff. The exporter evaluates sanitized TypeScript object literals in a Node `vm`; unusual expressions, dynamic imports, or non-static `require()` forms can break generation.

## Native host configuration

### React Native iOS host

- Workspace: `ios/Corivo.xcworkspace` after CocoaPods installation.
- Scheme: `Corivo`.
- Deployment target: iOS 15.1.
- Bundle ID: `com.corivo.app`.
- `ios/Podfile` disables the React Native New Architecture by default with `RCT_NEW_ARCH_ENABLED=0`.
- `ios/Corivo/Info.plist` also sets `RCTNewArchEnabled` to false.
- Photo read/add usage descriptions are present.
- URL schemes for Instagram, Instagram Stories, and Twitter are allow-listed for `canOpenURL` checks.
- Local networking is allowed for development; arbitrary network loads are not.
- `NSLocationWhenInUseUsageDescription` is empty even though the app has no active location feature. Do not add location access without a real product need and a valid explanation.

### React Native Android host

- Namespace/application ID: `com.corivo`.
- Min SDK: 24.
- Compile/target SDK: 36.
- Build tools: 36.0.0.
- Kotlin: 2.1.20.
- NDK: 27.1.12297006.
- Hermes is enabled.
- `newArchEnabled=true`, unlike iOS. Do not casually make cross-platform architecture flags match; verify every native dependency first.
- Edge-to-edge is disabled.
- Release builds currently use the debug keystore, enable ProGuard, and shrink resources. This is not production signing. Never publish it as a store release without a proper release signing configuration.
- The manifest currently declares Internet permission. Photo access behavior is partly delegated to image-picker/CameraRoll libraries, while the custom `ImagePickerScreen` requests legacy `READ_EXTERNAL_STORAGE`; validate current Android API behavior when touching it.
- The manifest declares `POST_NOTIFICATIONS`; runtime permission behavior is implemented by Notifee in `src/services/notifications.ts`.

## Dependencies and architectural choices

Primary active dependencies:

- React 19.1 and React Native 0.81.4.
- React Navigation native stack.
- Shopify React Native Skia for effect rendering and canvas snapshots.
- Zustand for state; MMKV and AsyncStorage for persistence.
- Reanimated and Gesture Handler for UI-thread motion and gestures.
- React Native Image Picker and CameraRoll for local photos.
- RNFS for thumbnails and export temporaries.
- React Native Share and Linking for export destinations.
- React Native Haptic Feedback.
- React Native Localize.
- Notifee for local scheduled inactivity reminders and notification settings.
- Safe Area Context and React Native Screens.

Dependencies installed but not necessarily part of the active architecture include React Query, Jotai, bottom tabs, Clipboard, FastImage, iOS utility packages, and Detox. Search for real imports before building on them. Do not introduce a second state/data-fetching architecture merely because a package is present.

There is no backend, HTTP client layer, API route tree, authentication provider, analytics SDK, or cloud database in the current application.

## Setup and commands

### Toolchain prerequisites

- Node.js 20 or newer.
- Corepack and Yarn 4.1.1.
- Xcode with an installed iOS simulator.
- Ruby compatible with the root `Gemfile` and CocoaPods.
- For Android: Android SDK 36, an appropriate JDK, and the configured NDK.

### Install

```bash
corepack enable
yarn install --immutable
bundle install
bundle exec pod install --project-directory=ios
```

Use the lockfiles. Do not run broad dependency upgrades for an unrelated change.

### Run the React Native app

```bash
yarn start
yarn ios
yarn android
```

Run Metro in one terminal and the platform command in another when needed. If Metro state is suspect:

```bash
yarn start --reset-cache
```

### React Native quality checks

```bash
yarn lint
yarn test --runInBand
yarn exec tsc --noEmit
yarn exec prettier --check .
```

Only `lint` and `test` are defined package scripts. There is currently no `type-check`, `format`, or `test:e2e` script despite README examples. Use the explicit `yarn exec` commands above, and do not claim Detox coverage: Detox is installed but no checked-in active configuration/script was found.

Run focused Jest tests during iteration:

```bash
yarn test src/domain/effects/__tests__/filters.test.ts --runInBand
yarn test __tests__/App.test.tsx --runInBand
```

Adjust the path to the feature under test. Tests inside a dirty worktree may belong to another in-progress task; inspect status before changing them.

### React Native builds

```bash
yarn ios:release
yarn android:release
yarn build:android:release
yarn build:android:bundle
```

Cleanup commands:

```bash
yarn clean:ios
yarn clean:android
```

Release commands validate compilation only. Android signing is still debug signing as noted above.

### Build and test the SwiftUI app

First regenerate shared metadata when effects or translations changed:

```bash
node Swift_version/Tools/export_corivo_metadata.js
```

List available destinations on the current machine:

```bash
xcodebuild -project Swift_version/Corivo.xcodeproj -scheme Corivo -showdestinations
```

Then use an installed simulator, for example:

```bash
xcodebuild \
  -project Swift_version/Corivo.xcodeproj \
  -scheme Corivo \
  -configuration Debug \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  build

xcodebuild \
  -project Swift_version/Corivo.xcodeproj \
  -scheme Corivo \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  test
```

Simulator names are machine-specific. Substitute a destination returned by `-showdestinations`; do not hard-code an unavailable device in CI.

## Test landscape

Tracked/baseline areas to look for:

- `__tests__/App.test.tsx` — root render smoke test.
- `src/domain/effects/__tests__/filters.test.ts` — ColorMatrix catalog and matrix invariants.
- `src/services/__tests__/notifications.test.ts` — reminder message uniqueness, 21-day scheduling, denied-permission behavior, and settings fallback.
- `Swift_version/Corivo/Tests/PersistenceTests.swift` — native project count semantics, persistence, rename, duplicate, delete, and export.
- `Swift_version/Corivo/Tests/MigrationTests.swift` — effect-value decoding and legacy React Native migration.

Additional feature tests may exist as untracked or in-progress work. Always inspect status before assuming they are committed contracts.

Major current test gaps:

- No automated pixel/snapshot validation for the 52 Skia effects.
- No exhaustive shader compilation test for every `shaderPath` and default parameter set.
- No active Detox configuration or end-to-end script.
- Limited database recovery/import coverage in the React Native implementation.
- Limited export/share cancellation and cleanup coverage.
- Theme and localization coverage is not exhaustive across every screen/language.

For shader work, a useful verification matrix is:

| Dimension | Cases |
| --- | --- |
| Image shape | portrait, landscape, square |
| Parameter values | min, default, max, each segmented option |
| Render target | editor preview, saved thumbnail, export |
| Lifecycle | new image, reopen project, undo/redo, reset |
| Platform | iOS simulator/device and Android emulator/device where supported |
| Failure | missing image, unknown effect, shader compile failure |

## Common change recipes

### Navigation or screen changes

1. Update `RootStackParamList` first.
2. Update navigator registration/presentation options.
3. Replace unsafe navigation casts in touched code with typed navigation.
4. Verify onboarding/hydration does not expose the route too early.
5. Test back gestures and modal dismissal on both platforms.

### Project schema changes

1. Update `src/types/index.ts`.
2. Update `ProjectDatabase` serialization/rehydration and import/export.
3. Update single-editor and Mixes save/load logic.
4. Update Recent Projects route classification and project-row display.
5. Decide how existing stored records migrate when a field is absent.
6. Update `Swift_version/Corivo/Data/Models.swift` and `MigrationCoordinator` if native parity/migration matters.
7. Add persistence and migration tests.

### Settings changes

1. Add the preference to `UserPreferences` and the app-store default.
2. Add a persisted migration/default for already-stored state if required.
3. Wire the setting to behavior; do not stop at UI state.
4. Add translations for label, state, description, and alerts.
5. Honor the haptic preference.
6. Test both state transitions and the downstream feature behavior.

### Localization changes

1. Change the `Translations` contract.
2. Update English semantics.
3. Update all 30 languages and preserve placeholders.
4. Update hook fallbacks only when backward compatibility needs them.
5. Run localization tests/type checking.
6. Regenerate Swift translations and review the diff.

### Export changes

1. Define whether the change affects single effects, mixes, or both.
2. Keep preview and export renderer semantics aligned.
3. Honor format/quality and filename extensions together.
4. Verify CameraRoll permissions, share MIME types, platform URL schemes, cancellation, and temp cleanup.
5. Update settings and onboarding/marketing copy only after behavior is real.
6. Test large portrait and landscape images for memory pressure.

### Notification changes

1. Keep the feature local unless remote push is explicitly requested.
2. Update the service, lifecycle listener, Settings permission UX, Android manifest, dependency/native install, translations, and Jest mocks together.
3. Use one deterministic notification ID for replacement/cancellation semantics.
4. Never prompt automatically as a side effect of a render.
5. Verify on a real iOS device and an Android 13+ device/emulator; Jest cannot validate native scheduling or OS settings behavior.

### React Native / Swift parity changes

1. Separate shared metadata from renderer behavior.
2. Change TypeScript sources and regenerate JSON.
3. Update Swift Codable models if the schema changed.
4. Update the Core Image mapping if the visual behavior changed.
5. Add migration coverage for existing React Native data.
6. Compare user-visible behavior, not exact pixels, unless exact parity is an explicit requirement.

## Coding conventions

### TypeScript and React Native

- Use functional components and hooks.
- Keep hook calls unconditional and near the top of the component.
- Prefer explicit interfaces/types at data and navigation boundaries.
- Avoid new `any`, `as any`, and `as never`; existing usages are debt, not style guidance.
- Use immutable Zustand updates and copy arrays/objects before mutation.
- Use relative imports; Metro currently has no path aliases.
- Use `StyleSheet.create` and existing design tokens.
- Put shared feature logic in domain/store/service modules rather than growing screen closures indefinitely.
- Use `logger` for reusable infrastructure logs. Avoid logging photo data, base64 exports, or sensitive local paths.
- Keep Reanimated's Babel plugin last in `babel.config.js`.
- Keep user-visible errors actionable and localized where the surface already supports localization.

### Skia and shaders

- Uniform names and types must match exactly.
- Convert booleans/options deliberately; do not rely on implicit JS-to-SkSL coercion.
- Clamp sampling coordinates and guard zero resolution/radius values.
- Bound shader loops with compile-time constants where SkSL requires it.
- Memoize RuntimeEffects and expensive uniform preparation.
- Preserve the original image fallback when compilation fails.
- Treat simulator success as necessary but not sufficient for performance.

### Swift

- Keep UI state on `@MainActor` where established.
- Use Codable value types for persisted data.
- Use atomic file writes for durable state.
- Preserve safe optional/fallback behavior for invalid legacy paths and unsupported effect IDs.
- Use `AppModel` as the app-wide dependency facade; avoid recreating stores/renderers inside views.
- Keep generated metadata out of handwritten business logic.

## Performance, reliability, and privacy

### Performance

- `EffectRenderer.tsx`, `EffectsEditorScreen.tsx`, and `MixesScreen.tsx` are the highest-risk rendering surfaces.
- Avoid state updates on every animation frame when a shared value or no-history update is sufficient.
- Canvas snapshot plus base64 encoding can spike memory. Avoid holding multiple full-resolution copies.
- Some inline effects use large nested sampling loops. Measure on physical devices before increasing radii or loop bounds.
- The registry's `complexity` property is metadata; the active `EffectRenderer` does not currently use `ImageProcessor.getAdaptiveQuality()`. Do not assume automatic preview downscaling.
- Project loading is N sequential AsyncStorage reads. Consider schema/index changes carefully if project counts grow.

### Reliability

- Clean up temporary exports in `finally`-style paths when modifying sharing.
- Do not delete source photos or user-selected assets.
- Preserve original image rendering when an effect is unknown or fails.
- Be tolerant of old projects missing optional fields.
- Validate AsyncStorage and filesystem errors rather than reporting placeholder success.
- Keep generated catalogs in sync before compiling the native port.

### Privacy and security

- Photos and project data should stay on device.
- Do not add analytics or telemetry by default.
- Request only permissions needed at the moment of user intent.
- Never include image bytes, full local paths, or project contents in logs/alerts.
- Sharing is an explicit user action and is the current boundary where data leaves the app.
- Review native manifests/plists whenever adding a permission or URL scheme.

## Known traps and architectural debt

- `README.md` is partially stale: annotation features, Pro/IAP, 4K export, and several scripts do not match current code.
- `LiquidRadialHomeScreen` is active; `HomeScreen` is not.
- The active home uses `react-native-image-picker`; `ImagePickerScreen` is an alternate registered screen.
- The effects store has stack APIs, but the active editor is single-effect.
- Mixes uses only effects with `shaderPath` and currently ignores layer opacity/blend mode.
- Standalone `.sksl` assets are not dynamically loaded; runtime shader sources are inline in TypeScript.
- `ImageProcessor` and `FilterRenderer` are not in the active main render call path.
- Export is fixed 1080 PNG despite format/quality preferences and newer 4K copy.
- Several Settings maintenance actions are placeholders.
- The notification switch is a denied-permission retry, not an on/off preference; authorized users do not see it and background scheduling remains active.
- Notification title/body copy is currently English-only.
- Some theme-aware infrastructure coexists with hard-coded dark screens.
- iOS disables the React Native New Architecture while Android enables it.
- Android release configuration uses debug signing.
- Effects and localization contracts are duplicated into generated Swift JSON.
- React Native and Swift renderers use different graphics stacks and will drift unless parity is maintained intentionally.
- `EffectRenderer.tsx` is a very large switch and a regression hotspot. Prefer contained helper extraction when touching multiple cases, but do not perform a broad rewrite as part of a small effect fix.
- `ProjectDatabase.forceReinitialize()` can clear unrelated AsyncStorage keys and should be a last-resort recovery path.
- Installed dependencies do not prove architectural adoption; verify imports and providers.

## Key file index

| Area | Key files |
| --- | --- |
| Boot | `index.js`, `App.tsx`, `app.json` |
| Navigation | `src/navigation/AppNavigator.tsx` |
| Active home | `src/screens/LiquidRadialHomeScreen.tsx`, `src/components/LiquidMenu/LiquidMenu.tsx` |
| Onboarding/splash | `src/screens/CorivoSplashScreen.tsx`, `src/screens/OnboardingScreen.tsx` |
| Single editor | `src/screens/EffectsEditorScreen.tsx` |
| Mix editor | `src/screens/MixesScreen.tsx` |
| Export | `src/screens/ExportScreen.tsx` |
| Projects | `src/screens/RecentProjectsScreen.tsx`, `src/components/projects/SwipeableProjectItem.tsx`, `src/components/modals/RenameProjectModal.tsx` |
| Settings/about | `src/screens/SettingsScreen.tsx`, `src/screens/AboutScreen.tsx` |
| Local notifications | `src/services/notifications.ts`, `src/services/__tests__/notifications.test.ts`, `src/navigation/AppNavigator.tsx` |
| Photo selection | `src/screens/LiquidRadialHomeScreen.tsx`, `src/screens/ImagePickerScreen.tsx`, `src/utils/imageUtils.ts` |
| Effect catalog | `src/domain/effects/types.ts`, `src/domain/effects/registry.ts` |
| Active renderer | `src/components/effects/EffectRenderer.tsx`, `src/domain/shader-manager/ShaderManager.ts` |
| Alternate renderers | `src/components/effects/FilterRenderer.tsx`, `src/domain/image-processor/ImageProcessor.ts`, `src/domain/effects/filters.ts` |
| Effect controls | `src/components/effects/EffectSlider.tsx`, `src/components/effects/EffectSegmentedControl.tsx` |
| App state | `src/stores/appStore.ts`, `src/hooks/useTheme.ts`, `src/hooks/useTranslation.ts` |
| Editor state | `src/stores/effectsStore.ts` |
| Project state | `src/stores/projectGalleryStore.ts`, `src/database/ProjectDatabase.ts`, `src/types/index.ts` |
| Design system | `src/constants/themes.ts`, `src/constants/colors.ts`, `src/constants/spacing.ts`, `src/constants/typography.ts` |
| Localization | `src/localization/translations.ts`, `src/localization/index.ts`, `src/localization/languages/*.ts` |
| RN iOS | `ios/Podfile`, `ios/Corivo/AppDelegate.swift`, `ios/Corivo/Info.plist`, `ios/Corivo.xcodeproj/project.pbxproj` |
| RN Android | `android/build.gradle`, `android/app/build.gradle`, `android/gradle.properties`, `android/app/src/main/AndroidManifest.xml` |
| Swift app | `Swift_version/Corivo/App/CorivoNativeApp.swift`, `Swift_version/Corivo/App/AppModel.swift`, `Swift_version/Corivo/Features/RootView.swift` |
| Swift data/rendering | `Swift_version/Corivo/Data/Models.swift`, `Swift_version/Corivo/Data/EffectRegistry.swift`, `Swift_version/Corivo/Data/RenderPipeline.swift`, `Swift_version/Corivo/Data/StoresAndMigration.swift` |
| Swift bridge | `Swift_version/Tools/export_corivo_metadata.js`, `Swift_version/Corivo/Resources/Generated/*.json` |
| Configuration | `package.json`, `yarn.lock`, `Gemfile`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `jest.config.js`, `.eslintrc.js`, `.prettierrc.js` |

## Definition of done

A change is complete when all applicable points are true:

- The correct implementation(s) were changed and unrelated dirty work was preserved.
- Data, route, effect, uniform, localization, and generated-metadata contracts remain aligned.
- User-visible copy matches actual behavior.
- Targeted tests pass, plus lint/type checking for TypeScript changes.
- Rendering changes were visually checked in all affected preview/export paths.
- Native changes build for a valid simulator; migration/persistence changes run native tests.
- Permissions, privacy, offline behavior, and temp-file cleanup were reviewed.
- No build output, dependency directory, secrets, signing material, or unrelated formatting entered the diff.
- The final handoff states what was changed, what was verified, and any remaining known limitation.


**Objective:** Generate a comprehensive, production-ready Software Design Document (SDD) for a new iOS-first mobile application named "Artifex". This document should be incredibly detailed, omitting only time/cost estimates. It must serve as the single source of truth for the design, development, and user experience of the application.

**App Vision:** Artifex is a premium, offline-first photo editing application for iOS, built with React Native. Its core purpose is to allow users to add high-quality, artistic annotations—watermarks, stickers, text, and stamps—to their photos. The user experience is paramount, defined by a fluid, gesture-driven interface and a rich set of "gorgeous," physics-based animations powered by React Native Reanimated and Skia. Monetization is handled exclusively through a one-time In-App Purchase (IAP) to unlock "Pro" features.

---

### **SDD Structure and Content Requirements**

Please generate the SDD following this precise structure and level of detail:

**1. Introduction & Overview**
   - **1.1. Project Name:** Artifex
   - **1.2. Vision Statement:** To be the most elegant and intuitive mobile tool for creative photo annotation, combining powerful offline capabilities with a delightful, animation-rich user experience.
   - **1.3. Target Audience:** Social media creators, small business owners, photographers, and casual users who want to protect or stylize their images before sharing.
   - **1.4. Core Philosophies:**
      - **Offline-First:** All core functionality, from editing to asset management, must be available without an internet connection.
      - **Gesture-Driven UX:** Prioritize swipes, drags, pinches, and long-presses over traditional button taps for all primary interactions and navigation. The experience should feel tactile and direct.
      - **Fluid & Performant:** All animations and interactions must run at a consistent 60/120fps. The app must feel responsive and instantaneous, leveraging the full power of Reanimated and Skia.
      - **Premium Aesthetics:** The UI design must be clean, minimalist, and modern, with a focus on typography, negative space, and a cohesive visual language.

**2. Detailed Functional Specification & User Flow**

Describe the complete user journey, screen by screen. For each screen, detail its purpose, components, UI, UX, gestures, and animations.

   - **2.1. First-Time User Experience (Onboarding)**
      - **Animated Splash Screen:**
         - **Concept:** Describe one of these two concepts in extreme detail.
            - **Option A (Physics-based Logo Shatter):** The app logo (a stylized "A") appears, then shatters into dozens of tiny particles using a physics simulation. These particles then gracefully reassemble into the main UI of the home screen.
            - **Option B (Kinetic Typography):** The word "Artifex" rapidly twists and morphs in 3D space on the screen, transitioning seamlessly into the main title of the home screen.
         - **Technology:** Specify the use of React Native Skia for custom shaders/drawing and Reanimated for the physics-based animation logic.
      - **Onboarding Carousel:** A three-screen, gesture-driven carousel (swipe left/right) highlighting the app's core features: (1) "Add Your Mark," (2) "Gesture-Powered Editing," (3) "Unlock Pro."
         - **UI/UX:** Full-screen, edge-to-edge visuals with minimal text. A parallax effect should be applied to the background images and text as the user swipes. The final screen has a prominent call-to-action button to enter the app.
         - **Animations:** Describe the "rubber band" effect on over-scrolling and the fluid transition of the progress indicator dots.

   - **2.2. Home Screen (Project Gallery)**
      - **UI Style:** A clean, minimalist grid of previously edited projects. Each grid item is a thumbnail of the final image. A large, prominent Floating Action Button (FAB) with a "+" icon to start a new project.
      - **Components:** Project Grid, FAB, "Settings" icon, "Go Pro" icon (if not purchased).
      - **Gestures:**
         - **Tap FAB:** Initiates the image selection flow with a smooth animation (e.g., the FAB expands to fill the screen).
         - **Tap Project Thumbnail:** Opens the project in the Editor screen.
         - **Long-press Project Thumbnail:** Triggers haptic feedback and enters a "selection mode" where the user can delete or duplicate projects. The selected thumbnail should scale up slightly.
      - **Animations:**
         - **Staggered Entrance:** When the app opens, grid items animate into view in a staggered, fade-in-up sequence.
         - **Layout Animations:** When a project is deleted, the other grid items should smoothly animate to fill the empty space.

   - **2.3. Image Selection Flow**
      - **UI/UX:** A custom, in-app image picker that feels superior to the native iOS picker. It should be a modal sheet that can be swiped down to be dismissed from any point.
      - **Components:** Tabs for "Recents," "Favorites," and "Albums." A live camera view option.
      - **Gestures:** Swipe down to dismiss. Pan across photos for quick selection.
      - **Animations:** The transition from the Home Screen to the Image Picker should be a seamless modal presentation, not a harsh push navigation.

   - **2.4. The Editor Screen (The Core Experience)**
      - **UI Layout:**
         - **Top Bar:** "Back," "Undo/Redo," "Export" buttons.
         - **Main Canvas:** The user's photo takes up the majority of the screen. All interactive elements (stickers, text) are rendered here using Skia for high performance.
         - **Bottom Toolbar:** A gesture-driven, horizontally-scrolling toolbar with icons for each tool category (Watermark, Text, Sticker, Stamp, Filters).
      - **Gestures (The heart of the app):**
         - **Toolbar:** Swipe left/right on the toolbar to switch between tool categories. The transition should be fluid, with the selected icon snapping to the center.
         - **Canvas:**
            - **Pinch:** to scale any selected element.
            - **Rotate:** with two fingers to rotate any selected element.
            - **Pan:** with one finger to move any selected element.
            - **Tap outside:** to deselect an element.
            - **Double-tap an element:** to open its specific editing options (e.g., double-tap text to bring up the keyboard).
      - **Tool-Specific Modals & Menus:**
         - When a tool is selected from the bottom bar (e.g., "Text"), a modal sheet slides up from the bottom, containing detailed options (font, color, alignment). This sheet can be dragged up to expand to full-screen or swiped down to dismiss.
         - **Animations:** Describe the physics-based spring animation for the presentation and dismissal of these modal sheets. When an option like a color is selected, there should be a subtle, satisfying micro-interaction (e.g., a ripple effect from the point of tap).
      - **Skia-Powered Canvas:**
         - All elements added to the photo are Skia objects, not native views. This allows for high-performance manipulation, custom shaders (e.g., for filter effects), and pixel-perfect rendering during export.
         - **Animations:** When a sticker is dragged, it should have a slight "magnetic" pull towards alignment guides (center, edges) and a subtle "bounce" animation upon release.

   - **2.5. Export Flow**
      - **UI/UX:** After tapping "Export," a modal sheet appears with options: "Save to Photos," "Share," and "Export Settings" (File Type: PNG/JPG, Quality: 90%/100%, etc.).
      - **Animations:** While the image is processing (should be nearly instant), show a custom, beautifully animated loader made with Skia (e.g., a pulsating orb or a fluid shape morphing).

**3. UI/UX Design System**
   - **3.1. Color Palette:** Define a primary, secondary, and accent color palette. Include neutral shades for backgrounds and text (e.g., Dark Mode first).
   - **3.2. Typography:** Specify the font family (e.g., a modern sans-serif like Inter), sizes, and weights for headings, subheadings, body text, and UI elements.
   - **3.3. Iconography:** A consistent set of custom-designed, minimalist icons. Specify their style (e.g., line icons, 2px stroke weight).
   - **3.4. Spacing & Layout:** Use an 8pt grid system for consistent spacing and alignment of all components.
   - **3.5. Component States:** Detail the visual appearance for `default`, `pressed`, `disabled`, and `focused` states for all interactive elements (buttons, list items, etc.). `Pressed` states must include a visual and haptic feedback response.

**4. Technical Architecture**
   - **4.1. Technology Stack:** React Native, React Native Reanimated, React Native Skia, TypeScript.
   - **4.2. State Management:** Propose a state management library (e.g., Zustand or Redux Toolkit) and explain why it's suitable for managing UI state and complex editor state.
   - **4.3. Navigation:** React Navigation, with a focus on a native stack navigator and custom modal presentation for a fluid, iOS-native feel. All transitions should be custom-animated using Reanimated.
   - **4.4. Offline Data Persistence:**
      - **Asset Management:** Describe how free and unlocked premium assets (stickers, fonts, stamps) are bundled with the app or downloaded on first launch.
      - **Project Storage:** Use a performant, local database like WatermelonDB or MMKV to store user projects, including the source image path and a serialized list of all edits (element type, position, scale, rotation, text content, etc.). This ensures projects are non-destructive.
   - **4.5. Image Processing Pipeline:**
      - Detail the process from image selection to export. Use a library like `react-native-skia` for rendering the final image by drawing the source image onto a canvas and then sequentially applying all user-added Skia objects on top before exporting the canvas as a high-resolution image file.

**5. Monetization Strategy (IAP)**
   - **5.1. Model:** Freemium with a one-time purchase ("Artifex Pro").
   - **5.2. Free Tier:**
      - Access to a limited set of stickers, fonts, and stamps.
      - A small, non-intrusive "Made with Artifex" watermark is automatically added on export (can be removed by watching a rewarded ad, if we decide to add that later, but the primary goal is the IAP).
   - **5.3. Pro Tier (Unlocked via IAP):**
      - Access to all premium asset packs (100+ exclusive stickers, 30+ pro fonts, etc.).
      - Removal of the "Made with Artifex" watermark.
      - Access to advanced features like custom font installation and saving personal watermarks as templates.
   - **5.4. "Go Pro" UI/UX:**
      - **Paywall Screen:** A beautifully designed screen explaining the benefits of Pro. It should not be intrusive but accessible from key points (e.g., a crown icon in the UI).
      - **Locked Assets:** Premium assets in the editor should be visible but marked with a crown icon. Tapping them should trigger a shimmer animation and present a non-obtrusive bottom sheet prompting the user to upgrade, rather than a jarring full-screen takeover.

**6. Non-Functional Requirements**
   - **6.1. Performance:** The app must maintain 60/120fps during all animations and interactions. Image processing and export must be highly optimized for speed.
   - **6.2. Accessibility (A11y):** The app must be usable for people with disabilities. All interactive elements should have proper labels for screen readers. Ensure sufficient color contrast.
   - **6.3. Error Handling:** Design graceful error states (e.g., if an image file is corrupted or storage permissions are denied) with clear, user-friendly messages.
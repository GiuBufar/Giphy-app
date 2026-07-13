---
name: Vibrant Motion System
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#ffb0cd'
  on-secondary: '#640039'
  secondary-container: '#aa0266'
  on-secondary-container: '#ffbad3'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#ffd9e4'
  secondary-fixed-dim: '#ffb0cd'
  on-secondary-fixed: '#3e0022'
  on-secondary-fixed-variant: '#8c0053'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1440px
---

## Brand & Style

The design system is built for a high-energy, expressive GIF exploration experience. The brand personality is **playful, digital-first, and immersive**, prioritizing content visibility above all else. By utilizing a deep, dark-themed canvas, the system ensures that the vibrant colors of GIFs and the primary electric purple accents remain the focal point of the user interface.

The aesthetic follows a **Modern Glassmorphic** direction. It combines the structured reliability of professional SaaS platforms with the expressive flair of entertainment apps. Key characteristics include:
- **Depth through Translucency:** Using frosted glass effects to maintain context while navigating dense media grids.
- **Vibrant Accents:** Utilizing high-saturation purples to guide action and denote active states.
- **High-Contrast Dark Mode:** A multi-layered dark palette that prevents visual fatigue while making motion content "pop."

## Colors

The palette is anchored by **Electric Purple (#8B5CF6)**, a high-vibrancy primary shade used for key interactions, branding, and focus states. 

- **Primary (Electric Purple):** Used for primary buttons, active tab indicators, and search focus borders.
- **Secondary (Pink/Magenta):** Used sparingly for "trending" or "favorite" interactions to add heat to the palette.
- **Tertiary (Cyan):** Reserved for technical metadata or secondary informational chips.
- **Neutral (Slate/Navy):** The foundation is a deep slate (#0F172A). Surfaces are layered using slightly lighter tints to create a sense of hierarchy without breaking the dark-mode immersion.

**Background Strategy:** 
The main viewport uses the deepest neutral. Surfaces like cards and navigation bars use semi-transparent overlays (Glassmorphism) to allow the background colors of GIFs to subtly bleed through the interface.

## Typography

This design system utilizes **Inter** exclusively to maintain a clean, systematic feel that balances the "loud" nature of animated content. 

- **Weight as Hierarchy:** Headlines use Extra Bold and Bold weights to anchor the page, especially since GIF thumbnails can be visually distracting.
- **Clarity in Metadata:** Labels and small text use medium weights with slight letter spacing to ensure legibility against dark, semi-transparent backgrounds.
- **Dynamic Scaling:** Mobile headlines are significantly reduced in size to maximize the "content-to-chrome" ratio, ensuring the GIF grid remains the priority on smaller screens.

## Layout & Spacing

The layout is designed as a **Fluid Masonry Grid** that optimizes for varying GIF aspect ratios.

- **Grid Strategy:** Use a 12-column grid for desktop with 24px gutters. On mobile, transition to a 2-column layout with 16px gutters to maintain thumbnail impact.
- **The Search Experience:** The search bar is a "sticky" element at the top of the viewport. On scroll, it should gain a background blur (Backdrop Filter) and a subtle bottom border to separate it from the content grid.
- **Margins:** Generous side margins (48px+) on desktop prevent the app from feeling claustrophobic, creating a "gallery" effect.
- **Rhythm:** All spacing is based on a 4px scale, ensuring consistent alignment between cards and controls.

## Elevation & Depth

Depth is communicated through **translucency and tonal layering** rather than traditional heavy shadows.

- **Surface Levels:** 
    - **Level 0 (Background):** Solid Neutral (#0F172A).
    - **Level 1 (Cards/Search):** 40% opacity neutral with a 20px Backdrop Blur.
    - **Level 2 (Hover/Modals):** 60% opacity neutral with a 40px Backdrop Blur and a subtle 1px white border at 10% opacity.
- **Shadows:** Use "Ambient Glows" for primary elements. Instead of black shadows, use a diffused purple shadow (`rgba(139, 92, 246, 0.3)`) with a high blur radius (30px+) for active buttons or featured content.
- **Outlines:** Low-contrast borders (1px, 15% white) are essential for defining the edges of glassmorphic elements against moving content.

## Shapes

The shape language is **distinctly soft and approachable**. 

Following the `rounded-2xl` requirement, the system uses a base radius of **16px (1rem)** for standard components like cards and input fields. 

- **Large Elements:** Modals and hero containers scale up to **24px (1.5rem)**.
- **Interactive Elements:** Buttons and tags follow the 16px rule to maintain a consistent "squishy" but modern silhouette.
- **Search Bar:** Should be fully pill-shaped (999px) to distinguish it as the primary functional tool.

## Components

### Search Bar
A prominent, pill-shaped input. It features a glassmorphic background (`backdrop-filter: blur(12px)`) and an Electric Purple focus ring. The placeholder text should be a dimmed neutral.

### GIF Cards
Cards have no visible solid background by default. On hover, a glassmorphic overlay appears with `rounded-2xl` corners, showing quick actions (copy link, favorite, share). The card container uses `overflow: hidden` to ensure the GIF matches the corner radius.

### Buttons
- **Primary:** Solid Electric Purple with white text. High-contrast and bold.
- **Secondary/Glass:** A semi-transparent white background (10%) with a blur. Perfect for "Load More" or pagination controls.

### Tab Navigation
A horizontal list of labels. The active state is indicated by a solid Electric Purple "pill" background behind the text, rather than a simple underline, emphasizing the playful shape language.

### Pagination Controls
Large, easy-to-tap glassmorphic squares or circles. Use icons for "Next/Prev" and bold typography for page numbers. Ensure the "Active" page number is highlighted in the primary purple.

### Chips/Tags
Small, `rounded-full` elements used for categories (e.g., #funny, #reaction). These should use the Tertiary (Cyan) or Secondary (Pink) colors at 10% opacity with saturated text colors to differentiate them from primary actions.
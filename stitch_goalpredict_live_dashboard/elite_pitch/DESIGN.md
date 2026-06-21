---
name: Elite Pitch
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
  on-surface-variant: '#bccbb9'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#869585'
  outline-variant: '#3d4a3d'
  surface-tint: '#4ae176'
  primary: '#4be277'
  on-primary: '#003915'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#006e2f'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#ffb5ab'
  on-tertiary: '#60130d'
  tertiary-container: '#ff8b7c'
  on-tertiary-container: '#76231b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#7f2a21'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
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
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-desktop: 32px
  margin-mobile: 16px
  card-padding: 20px
  widget-gap: 24px
---

## Brand & Style
The design system is engineered for a high-performance, data-rich environment that merges the precision of professional sports analytics with the immersive energy of modern esports. It targets a sophisticated audience that demands real-time accuracy and deep statistical insight without sacrificing visual excitement.

The style is **Corporate Modern with Glassmorphic accents**. It utilizes a dark, atmospheric base to allow data visualizations and action states to pop with high-chroma vitality. The aesthetic is defined by layered transparency, crisp structural borders, and purposeful "live" indicators that create a sense of urgency and prestige. The emotional response is one of authority, focus, and competitive thrill.

## Colors
This design system operates on a deep, multi-tonal dark palette. The foundation is **Dark Navy (#0F172A)** for primary backgrounds, with **Deep Slate (#1E293B)** used for surface cards and containers to create depth.

The primary accent is **Pitch Green (#22C55E)**, reserved exclusively for primary actions, success states, and "Live" indicators. A secondary **Sky Blue (#38BDF8)** is used for informational data points and secondary highlights to prevent visual fatigue from a single-accent palette. Functional colors include a sharp Red for danger/loss and a muted Gold for premium leaderboard status or high-tier achievements. 

All interactive elements in the primary color should carry a subtle soft glow (`accent_glow`) when active or "Live" to simulate the luminescence of a stadium scoreboard.

## Typography
The design system relies on **Inter** to deliver a systematic, utilitarian, yet modern feel. The hierarchy is designed to handle dense data:

- **Display & Headlines:** Use heavy weights (700-800) with slight negative letter spacing to create a compact, impactful look suitable for scorelines and large dashboard titles.
- **Data Mono:** While Inter is sans-serif, using it with tighter tracking and medium weights for numerical data ensures scores and percentages remain legible and aligned in dense tables.
- **Label Caps:** Small, bold, all-caps labels are used for metadata like "KICK OFF TIME" or "PROBABILITY" to differentiate labels from dynamic data values.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high-density spacing. A 12-column system is used for desktop, shifting to a single column for mobile. 

- **Containers:** Dashboard widgets are housed in modular cards with a 24px gap (`widget-gap`) to allow the dark background to act as natural "breathing room" between dense data points.
- **Internal Padding:** Cards use a consistent 20px padding (`card-padding`) to ensure stats and text don't feel cramped against the rounded corners.
- **Alignment:** All elements must align to an 8px baseline grid to maintain the "precision-engineered" look expected of a data dashboard.

## Elevation & Depth
Depth is communicated through **Tonal Layering and Glassmorphism** rather than traditional heavy shadows.

- **Level 0 (Background):** #0F172A. Pure flat base.
- **Level 1 (Cards/Widgets):** #1E293B with a 1px border of `rgba(255, 255, 255, 0.08)`. This "crisp border" defines the shape against the dark background.
- **Level 2 (Headers/Sidebars):** Glassmorphic surfaces using `backdrop-filter: blur(12px)` and a semi-transparent Deep Slate fill. This creates a premium, high-tech overlay feel.
- **Active State Glow:** Elements like "Live" badges or selected prediction cards use a soft outer glow of the primary green to indicate "broadcast" status.

## Shapes
The shape language is modern and approachable but maintains a structural edge. 

- **Cards:** Use the `rounded-lg` (16px) or `rounded-xl` (24px) tokens to create a "containerized" look that feels like a modern mobile OS or high-end car dashboard.
- **Action Elements:** Buttons and input fields follow the `rounded-lg` (16px) standard for a cohesive feel.
- **Badges:** Small informational badges (e.g., "HT", "FT", league names) should use a smaller 4px radius to distinguish them from larger interactive components.

## Components
- **Match Cards:** The centerpiece of the system. Features team logos, a central score/time area with high-contrast typography, and a "Prediction Bar" at the bottom. Use a 1px subtle border to separate the card from the background.
- **Stats Bars:** Use a dual-color track. The background is a dark neutral, and the "fill" uses a gradient of Pitch Green to indicate momentum or probability.
- **Podium Leaderboard:** For user rankings. The top 3 users are displayed in cards with elevated glassmorphism and metallic accent borders (Gold, Silver, Bronze).
- **Action Buttons:** Primary buttons are solid Pitch Green with black text for maximum contrast. Secondary buttons use a "ghost" style with a Pitch Green border.
- **Input Fields:** Deep Slate background with a 1px border that glows Pitch Green on focus.
- **Sports Badges:** Circular or shield-shaped containers for team crests, always accompanied by a 2px stroke to ensure visibility against dark surfaces.
- **Live Indicators:** A small pulsing dot component utilizing the `accent_glow` variable to signal real-time data updates.
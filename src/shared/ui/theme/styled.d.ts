import 'styled-components'

type PaletteRamp = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>

type SemanticColor = {
  50: string
  bg: string
  border: string
  fg: string
  base: string
  fgOn: string
}

type TypePreset = {
  size: string
  line: string
  tracking: string
  weight: string
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: PaletteRamp
      neutral: PaletteRamp
      success: SemanticColor
      warning: SemanticColor
      error: SemanticColor
      info: SemanticColor
      bg: {
        page: string
        card: string
        elevated: string
        overlay: string
        inverse: string
        secondary: string
      }
      text: {
        primary: string
        secondary: string
        muted: string
        disabled: string
        inverse: string
        strong: string
        link: string
        linkHover: string
      }
      border: {
        subtle: string
        default: string
        strong: string
        focus: string
      }
    }
    spacing: Record<0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32, string>
    radii: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full', string>
    shadows: Record<'elevation1' | 'elevation2' | 'elevation3' | 'elevation4' | 'focusRing', string>
    zIndex: Record<
      'dropdown' | 'sticky' | 'fixed' | 'modalBackdrop' | 'modal' | 'popover' | 'toast' | 'tooltip',
      string
    >
    breakpoints: Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', string>
    motion: {
      duration: Record<'instant' | 'fast' | 'base' | 'slow' | 'slower', string>
      easing: Record<'out' | 'in' | 'inOut' | 'spring', string>
    }
    typography: {
      fontFamily: Record<'display' | 'body' | 'mono', string>
      type: Record<
        'caption' | 'small' | 'body' | 'bodyLg' | 'h4' | 'h3' | 'h2' | 'h1' | 'display',
        TypePreset
      >
      featureNumeric: string
    }
  }
}

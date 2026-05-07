import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>
      secondary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>
      neutral: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>
      error: string
      warning: string
      success: string
      info: string
    }
    typography: {
      fontFamily: string
      fontSize: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl', string>
      fontWeight: Record<'regular' | 'medium' | 'semibold' | 'bold', number>
      lineHeight: Record<'tight' | 'normal' | 'relaxed', number>
    }
    spacing: Record<0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24, string>
    radii: Record<'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full', string>
    shadows: Record<'sm' | 'md' | 'lg' | 'xl', string>
    breakpoints: Record<'sm' | 'md' | 'lg' | 'xl', string>
    zIndex: Record<'dropdown' | 'sticky' | 'overlay' | 'modal' | 'toast', number>
  }
}

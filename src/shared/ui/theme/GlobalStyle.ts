import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.type.body.size};
    line-height: ${({ theme }) => theme.typography.type.body.line};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.bg.page};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
  }

  input, button, textarea, select {
    font: inherit;
  }

  p, h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  #root, #__next {
    isolation: isolate;
  }

  :focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadows.focusRing};
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`

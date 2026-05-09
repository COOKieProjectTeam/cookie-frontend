import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import '@/shared/ui/theme/tokens.css'
import { StyledComponentsRegistry } from '@/shared/ui/theme/StyledComponentsRegistry'
import { AppThemeProvider } from '@/shared/ui/theme/AppThemeProvider'
import { QueryProvider } from '@/shared/api/QueryProvider'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'cyrillic-ext', 'latin-ext'],
  display: 'swap',
  variable: '--font-bricolage',
})

export const metadata: Metadata = {
  title: 'COOKie — рецепты и планирование питания',
  description: 'Каталог рецептов, планирование питания и КБЖУ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={bricolage.variable}>
      <body>
        <StyledComponentsRegistry>
          <AppThemeProvider>
            <QueryProvider>{children}</QueryProvider>
          </AppThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}

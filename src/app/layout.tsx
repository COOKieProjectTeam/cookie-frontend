import type { Metadata } from 'next'
import { StyledComponentsRegistry } from '@/shared/ui/theme/StyledComponentsRegistry'
import { AppThemeProvider } from '@/shared/ui/theme/AppThemeProvider'
import { QueryProvider } from '@/shared/api/QueryProvider'

export const metadata: Metadata = {
  title: 'COOKie — рецепты и планирование питания',
  description: 'Каталог рецептов, планирование питания и КБЖУ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
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

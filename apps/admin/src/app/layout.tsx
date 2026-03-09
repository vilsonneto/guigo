import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guigo — Admin',
  description: 'Painel de monitoramento do Guigo',
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

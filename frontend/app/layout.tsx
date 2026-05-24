import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/auth-context'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Iustitia Et Pax',
  description: 'Sistema de gestión de conciliaciones',
  generator: 'f4ntasma',
  icons: {
    icon: [
      {
        url: '/logowithbackground.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/logowithbackground.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/logowithbackground.png',
        type: 'image/png',
      },
    ],
    apple: '/logowithbackground.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

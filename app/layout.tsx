import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rastreador de Gastos - Controla tus finanzas',
  description: 'App para rastrear gastos con OCR y categorías automáticas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#f8fafc]">
        {children}
      </body>
    </html>
  )
}
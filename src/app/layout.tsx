import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Lenno – Freelance Platform",
  description: "Find the right job. Work without borders.",
  openGraph: {
    title: "Lenno – Freelance Platform",
    description: "Find the right job. Work without borders.",
    url: "https://lenno.xyz",
    siteName: "Lenno",
    images: [
      {
        url: "https://lenno.xyz/og-image.png", // your thumbnail image
        width: 1200,
        height: 630,
        alt: "Lenno Freelance Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lenno – Freelance Platform",
    description: "Find the right job. Work without borders.",
    images: ["https://lenno.xyz/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          {children}
      </body>
    </html>
  )
}
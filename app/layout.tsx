import type { Metadata, Viewport } from "next"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "BiteDex 一口图鉴",
  description: "拍食物，生成卡片，用宠物反馈你的饮食状态",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BiteDex",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="safe-area-padding">{children}</body>
    </html>
  )
}

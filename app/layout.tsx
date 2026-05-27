import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BiteDex 一口图鉴",
  description: "拍食物，生成卡片，用宠物反馈你的饮食状态",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

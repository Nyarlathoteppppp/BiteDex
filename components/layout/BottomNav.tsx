"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Camera, BookOpen, BarChart3 } from "lucide-react"

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/capture", label: "拍照", icon: Camera },
  { href: "/dex", label: "图鉴", icon: BookOpen },
  { href: "/analysis", label: "分析", icon: BarChart3 },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                active ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={active ? "font-semibold" : ""}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

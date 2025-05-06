"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="font-bold text-2xl">Winnie</span>
        </Link>
        <nav className="flex items-center gap-4">
          {/* Cart button removed to avoid duplication with the floating cart button */}
        </nav>
      </div>
    </header>
  )
} 
"use client"

import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Package, Truck, Globe, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

const bannerItems = [
  {
    title: "Authentic Indian Products",
    description: "Discover handpicked treasures from India - from traditional handicrafts to modern fashion. Shop with confidence!",
    icon: Package,
    color: "bg-orange-500",
    cta: "Shop Now",
    link: "/products",
  },
  {
    title: "Direct from India",
    description: "Get your favorite Indian products delivered straight from India to your doorstep. No middlemen, just authentic goods!",
    icon: Globe,
    color: "bg-blue-500",
    cta: "Learn More",
    link: "/about#direct-shipping",
  },
  {
    title: "Support Indian Artisans",
    description: "Every purchase helps support local Indian artisans and small businesses. Make a difference with your shopping!",
    icon: Sparkles,
    color: "bg-green-500",
    cta: "Meet Artisans",
    link: "/artisans",
  },
  {
    title: "Fast & Reliable Shipping",
    description: "Enjoy quick delivery with real-time tracking. Free shipping on orders above $100!",
    icon: Truck,
    color: "bg-purple-500",
    cta: "Shipping Info",
    link: "/shipping",
  },
]

export function Banner() {
  const [api, setApi] = useState<any>(null)

  useEffect(() => {
    if (!api) return

    const interval = setInterval(() => {
      api.scrollNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [api])

  return (
    <div className="w-full py-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {bannerItems.map((item, index) => (
            <CarouselItem key={index} className="basis-full">
              <Card className="border-none bg-gradient-to-r from-background to-muted">
                <CardContent className="flex items-center justify-between p-8">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-full ${item.color}`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">{item.title}</h3>
                      <p className="text-muted-foreground max-w-xl">{item.description}</p>
                    </div>
                  </div>
                  <Link 
                    href={item.link}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
} 
"use client"

import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Utensils, Clock, MapPin, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

const bannerItems = [
  {
    title: "Discover Authentic Indian Cuisine",
    description: "Experience the rich flavors of India with our carefully curated menu. Order now and get 20% off on your first order!",
    icon: Utensils,
    color: "bg-orange-500",
    cta: "Learn More",
    link: "/about#authentic-cuisine",
  },
  {
    title: "Lightning Fast Delivery",
    description: "Get your favorite dishes delivered to your doorstep in under 30 minutes. Free delivery on orders above $50!",
    icon: Clock,
    color: "bg-blue-500",
    cta: "Learn More",
    link: "/about#fast-delivery",
  },
  {
    title: "Support Local Restaurants",
    description: "Join us in supporting local Indian restaurants in your neighborhood. Every order helps keep our community thriving!",
    icon: MapPin,
    color: "bg-green-500",
    cta: "Learn More",
    link: "/about#local-restaurants",
  },
  {
    title: "Premium Quality Guaranteed",
    description: "Only the finest ingredients and authentic recipes. Try our chef's special menu this weekend!",
    icon: Sparkles,
    color: "bg-purple-500",
    cta: "Learn More",
    link: "/about#premium-quality",
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
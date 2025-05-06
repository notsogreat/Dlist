"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Globe, Sparkles, Truck } from "lucide-react"

const features = [
  {
    id: "authentic-products",
    title: "Authentic Indian Products",
    icon: Package,
    color: "bg-orange-500",
    description: "Discover handpicked treasures from India's rich cultural heritage",
    details: [
      "Curated selection of traditional and modern Indian products",
      "Direct sourcing from Indian artisans and manufacturers",
      "Quality verification and authenticity checks",
      "Wide range of categories from clothing to handicrafts",
      "Regular updates with new arrivals and seasonal collections"
    ],
    image: "/images/authentic-products.jpg"
  },
  {
    id: "direct-shipping",
    title: "Direct from India",
    icon: Globe,
    color: "bg-blue-500",
    description: "Straight from Indian artisans to your doorstep",
    details: [
      "Direct partnerships with Indian sellers and artisans",
      "No middlemen, ensuring fair prices",
      "Transparent supply chain",
      "Support for small businesses and local communities",
      "Cultural authenticity in every product"
    ],
    image: "/images/direct-shipping.jpg"
  },
  {
    id: "artisan-support",
    title: "Support Indian Artisans",
    icon: Sparkles,
    color: "bg-green-500",
    description: "Empowering local artisans and preserving traditional crafts",
    details: [
      "Fair trade practices and ethical sourcing",
      "Preservation of traditional Indian craftsmanship",
      "Stories behind the products and their makers",
      "Community development initiatives",
      "Sustainable and eco-friendly products"
    ],
    image: "/images/artisan-support.jpg"
  },
  {
    id: "reliable-shipping",
    title: "Fast & Reliable Shipping",
    icon: Truck,
    color: "bg-purple-500",
    description: "Seamless international shipping experience",
    details: [
      "Efficient international shipping network",
      "Real-time tracking for all orders",
      "Secure packaging and handling",
      "Free shipping on orders above $100",
      "Dedicated customer support for shipping queries"
    ],
    image: "/images/reliable-shipping.jpg"
  }
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Winnie</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're on a mission to bring authentic Indian products to your doorstep while supporting local artisans and ensuring the highest quality in every purchase.
        </p>
      </div>

      <div className="grid gap-8">
        {features.map((feature) => (
          <Card key={feature.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-muted">
                <div className="aspect-video relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`p-6 rounded-full ${feature.color}`}>
                      <feature.icon className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3">
                <CardHeader>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-lg">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${feature.color} mt-2`} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Our Commitment</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          At Winnie, we're committed to bringing you authentic Indian products while supporting local artisans and preserving traditional craftsmanship. Every purchase helps us grow and serve you better.
        </p>
      </div>
    </div>
  )
} 
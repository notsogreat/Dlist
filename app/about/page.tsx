"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Clock, MapPin, Sparkles } from "lucide-react"

const features = [
  {
    id: "authentic-cuisine",
    title: "Authentic Indian Cuisine",
    icon: Utensils,
    color: "bg-orange-500",
    description: "Experience the rich flavors of India with our carefully curated menu",
    details: [
      "Handpicked recipes from across India's diverse culinary landscape",
      "Authentic spices and ingredients sourced directly from India",
      "Regular menu updates featuring seasonal specialties",
      "Special dietary accommodations available (vegetarian, vegan, gluten-free)",
      "Chef's special recommendations for the best experience"
    ],
    image: "/images/authentic-cuisine.jpg"
  },
  {
    id: "fast-delivery",
    title: "Lightning Fast Delivery",
    icon: Clock,
    color: "bg-blue-500",
    description: "Get your favorite dishes delivered to your doorstep in under 30 minutes",
    details: [
      "Optimized delivery routes for maximum efficiency",
      "Real-time order tracking",
      "Temperature-controlled delivery bags",
      "Free delivery on orders above $50",
      "Express delivery options available"
    ],
    image: "/images/fast-delivery.jpg"
  },
  {
    id: "local-restaurants",
    title: "Support Local Restaurants",
    icon: MapPin,
    color: "bg-green-500",
    description: "Join us in supporting local Indian restaurants in your neighborhood",
    details: [
      "Partnership with family-owned Indian restaurants",
      "Direct support to local business owners",
      "Community events and food festivals",
      "Regular restaurant spotlights and features",
      "Special promotions for local restaurant partners"
    ],
    image: "/images/local-restaurants.jpg"
  },
  {
    id: "premium-quality",
    title: "Premium Quality Guaranteed",
    icon: Sparkles,
    color: "bg-purple-500",
    description: "Only the finest ingredients and authentic recipes",
    details: [
      "Rigorous quality control standards",
      "Fresh ingredients daily",
      "Hygiene and safety certifications",
      "Regular kitchen inspections",
      "Customer satisfaction guarantee"
    ],
    image: "/images/premium-quality.jpg"
  }
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Winnie</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're on a mission to bring the authentic flavors of India to your doorstep while supporting local restaurants and ensuring the highest quality in every dish.
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
          At Winnie, we're committed to providing you with the best Indian dining experience while supporting our local community. Every order helps us grow and serve you better.
        </p>
      </div>
    </div>
  )
} 
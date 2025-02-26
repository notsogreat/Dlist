"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, ShoppingCart } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { submitWishlist } from "@/app/actions/submit-wishlist"
import { UserDetailsCard } from "@/components/wishlist/user-details-card"
import { ItemForm } from "@/components/wishlist/item-form"
import { ItemList } from "@/components/wishlist/item-list"
import { ItemType, UserDetails } from "@/types/wishlist"

export default function WishlistPage() {
  const router = useRouter()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [items, setItems] = useState<ItemType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const details = localStorage.getItem("userDetails")
    if (details) {
      setUserDetails(JSON.parse(details))
    } else {
      router.push("/")
    }
  }, [router])

  function onAddItem(values: ItemType) {
    const cleanedValues = {
      ...values,
      link: values.link || undefined,
      storeAddress: values.storeAddress || undefined,
      storePhone: values.storePhone || undefined,
      pickupAddress: values.pickupAddress || undefined,
      pickupPhone: values.pickupPhone || undefined,
    }
    setItems((prev) => [...prev, cleanedValues])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmitWishlist() {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const result = await submitWishlist({ userDetails, items })
      if (result.success) {
        localStorage.removeItem("userDetails")
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } else {
        setSubmitError(result.message)
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userDetails) return null

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <UserDetailsCard userDetails={userDetails} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Add Items to Your Wish List
            </CardTitle>
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ItemForm onSubmit={onAddItem} />

            {items.length > 0 && (
              <ItemList
                items={items}
                onRemoveItem={removeItem}
                onSubmit={onSubmitWishlist}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


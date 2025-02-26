"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Package, Trash2, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { submitWishlist } from "@/app/actions/submit-wishlist"

const itemFormSchema = z.object({
  itemName: z.string().min(2, { message: "Item name is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  weight: z.string().min(1, { message: "Weight is required" }),
  category: z.enum(["Local Store", "Online", "Home Pickup"]),
  // Make all additional fields optional but with validation when required
  link: z.string().optional().or(z.literal("")),
  storeAddress: z.string().optional().or(z.literal("")),
  storePhone: z.string().optional().or(z.literal("")),
  pickupAddress: z.string().optional().or(z.literal("")),
  pickupPhone: z.string().optional().or(z.literal("")),
})

type ItemType = z.infer<typeof itemFormSchema>

export default function WishlistPage() {
  const router = useRouter()
  const [userDetails, setUserDetails] = useState<any>(null)
  const [items, setItems] = useState<ItemType[]>([])

  useEffect(() => {
    const details = localStorage.getItem("userDetails")
    if (details) {
      setUserDetails(JSON.parse(details))
    } else {
      router.push("/")
    }
  }, [router])

  const form = useForm<ItemType>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      itemName: "",
      quantity: "",
      weight: "",
      category: undefined, // Will be set when user selects
      link: "",
      storeAddress: "",
      storePhone: "",
      pickupAddress: "",
      pickupPhone: "",
    },
  })

  const category = form.watch("category")

  function onAddItem(values: ItemType) {
    // Clean up empty optional fields before adding
    const cleanedValues = {
      ...values,
      link: values.link || undefined,
      storeAddress: values.storeAddress || undefined,
      storePhone: values.storePhone || undefined,
      pickupAddress: values.pickupAddress || undefined,
      pickupPhone: values.pickupPhone || undefined,
    }
    setItems((prev) => [...prev, cleanedValues])
    form.reset({
      itemName: "",
      quantity: "",
      weight: "",
      category: undefined,
      link: "",
      storeAddress: "",
      storePhone: "",
      pickupAddress: "",
      pickupPhone: "",
    })
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function onSubmitWishlist() {
    setIsSubmitting(true)
    setSubmitError(null)
    const wishlist = {
      userDetails,
      items,
    }
    try {
      const result = await submitWishlist(wishlist)
      if (result.success) {
        localStorage.removeItem("userDetails")
        setTimeout(() => {
          router.push("/")
        }, 3000) // Redirect after 3 seconds
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
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <p>
                <strong>Name:</strong> {userDetails.name}
              </p>
              <p>
                <strong>Address:</strong> {userDetails.address}
              </p>
              <p>
                <strong>Phone:</strong> {userDetails.phone}
              </p>
              <p>
                <strong>Email:</strong> {userDetails.email}
              </p>
            </div>
          </CardContent>
        </Card>

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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddItem)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="itemName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2 kg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Local Store">Local Store</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                          <SelectItem value="Home Pickup">Home Pickup</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {category === "Online" && (
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Online Link</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {category === "Local Store" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="storeAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter store address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="storePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter store phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {category === "Home Pickup" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="pickupAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pickup address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickupPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </form>
            </Form>

            {items.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="font-semibold">Added Items</h3>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="grid gap-1">
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} • Weight: {item.weight} • Category: {item.category}
                              </p>
                              {item.category === "Online" && item.link && <p className="text-sm">Link: {item.link}</p>}
                              {item.category === "Local Store" && item.storeAddress && (
                                <p className="text-sm">Store: {item.storeAddress}</p>
                              )}
                              {item.category === "Home Pickup" && item.pickupAddress && (
                                <p className="text-sm">Pickup: {item.pickupAddress}</p>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button
                    onClick={onSubmitWishlist}
                    className="w-full"
                    size="lg"
                    variant="default"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Submit Wish List ({items.length} {items.length === 1 ? "item" : "items"})
                      </>
                    )}
                  </Button>

                  {submitError && <p className="text-red-500 text-center">{submitError}</p>}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


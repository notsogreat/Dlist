import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ItemType, itemFormSchema } from "@/types/wishlist"

interface ItemFormProps {
  onSubmit: (values: ItemType) => void
}

export function ItemForm({ onSubmit }: ItemFormProps) {
  const form = useForm<ItemType>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      itemName: "",
      quantity: "",
      weight: "",
      category: undefined,
      link: "",
      storeAddress: "",
      storePhone: "",
      pickupAddress: "",
      pickupPhone: "",
    },
  })

  const category = form.watch("category")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
  )
} 
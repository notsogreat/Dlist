import { Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ItemType } from "@/types/wishlist"

interface ItemListProps {
  items: ItemType[]
  onRemoveItem: (index: number) => void
  onSubmit: () => void
  isSubmitting: boolean
  submitError: string | null
}

export function ItemList({ items, onRemoveItem, onSubmit, isSubmitting, submitError }: ItemListProps) {
  return (
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
                    {item.category === "Online" && item.link && (
                      <p className="text-sm">Link: {item.link}</p>
                    )}
                    {item.category === "Local Store" && (
                      <>
                        {item.storeAddress && <p className="text-sm">Store: {item.storeAddress}</p>}
                        {item.storePhone && <p className="text-sm">Store Phone: {item.storePhone}</p>}
                      </>
                    )}
                    {item.category === "Home Pickup" && (
                      <>
                        {item.pickupAddress && <p className="text-sm">Pickup: {item.pickupAddress}</p>}
                        {item.pickupPhone && <p className="text-sm">Pickup Phone: {item.pickupPhone}</p>}
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button onClick={onSubmit} className="w-full" size="lg" variant="default" disabled={isSubmitting}>
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Submit Wish List ({items.length} {items.length === 1 ? "item" : "items"})
            </>
          )}
        </Button>

        {submitError && <p className="text-red-500 text-center">{submitError}</p>}
      </div>
    </>
  )
} 
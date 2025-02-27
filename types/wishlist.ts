import { z } from "zod"

// Common fields for all items
const baseItemSchema = z.object({
  itemName: z.string().min(2, { message: "Item name is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  weight: z.string().min(1, { message: "Weight is required" }),
  category: z.enum(["Local Store", "Online", "Home Pickup"]),
})

// Category-specific fields
const onlineFields = z.object({
  link: z.string().optional(),
})

const localStoreFields = z.object({
  storeAddress: z.string().optional(),
  storePhone: z.string().optional(),
})

const homePickupFields = z.object({
  pickupAddress: z.string().optional(),
  pickupPhone: z.string().optional(),
})

// Combined schema that includes all possible fields
export const itemFormSchema = baseItemSchema
  .and(onlineFields)
  .and(localStoreFields)
  .and(homePickupFields)

export type ItemType = z.infer<typeof itemFormSchema>

export interface UserDetails {
  name: string
  address: string
  phone: string
  email: string
  preferredContact: "Text" | "WhatsApp" | "Call" | "Email"
  feedback?: string
}

export interface WishlistSubmission {
  userDetails: UserDetails
  items: ItemType[]
} 
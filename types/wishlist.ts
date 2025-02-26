import { z } from "zod"

export const itemFormSchema = z.object({
  itemName: z.string().min(2, { message: "Item name is required" }),
  quantity: z.string().min(1, { message: "Quantity is required" }),
  weight: z.string().min(1, { message: "Weight is required" }),
  category: z.enum(["Local Store", "Online", "Home Pickup"]),
  link: z.string().optional().or(z.literal("")),
  storeAddress: z.string().optional().or(z.literal("")),
  storePhone: z.string().optional().or(z.literal("")),
  pickupAddress: z.string().optional().or(z.literal("")),
  pickupPhone: z.string().optional().or(z.literal("")),
})

export type ItemType = z.infer<typeof itemFormSchema>

export interface UserDetails {
  name: string
  address: string
  phone: string
  email: string
}

export interface WishlistSubmission {
  userDetails: UserDetails
  items: ItemType[]
} 
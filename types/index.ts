export interface Item {
  id: string
  name: string
  price: number
  image: string
  weight?: string
  packSize?: string
}

export interface Category {
  id: string
  name: string
  items: Item[]
}

export interface SpecialOption {
  id: string
  name: string
  description: string
  iconType: "Store" | "Home" | "Online"
  price: string
  image?: string
}

export interface CategoriesData {
  categories: Category[]
}

export interface SpecialOptionsData {
  specialOptions: SpecialOption[]
}

export interface CartItem extends Item {
  quantity: number
  specialData?: any
} 
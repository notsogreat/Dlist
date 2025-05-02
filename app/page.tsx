"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Menu, Search, ChevronLeft, ChevronRight, Store, Home as HomeIcon, Minus, Plus, Trash2, Scale, Package, Globe, ShoppingCart, CheckCircle } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { Banner } from "@/components/banner"
import categoriesData from "@/data/categories.json"
import specialOptionsData from "@/data/special-options.json"
import { Category, SpecialOption, CartItem, CategoriesData, SpecialOptionsData } from "@/types"
import { LucideIcon } from "lucide-react"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { submitOrder } from "@/app/actions/submit-order"

// Update formSchema to have conditional validation
const getFormSchema = (selectedOptionId: string | null) => {
  // Base schema with common fields
  const baseSchema = {
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    preferredContact: z.string().optional(),
    itemName: z.string().optional(),
    totalWeight: z.string().optional(),
    quantity: z.string().optional(),
    storeAddress: z.string().optional(),
    storePhone: z.string().optional(),
    homeAddress: z.string().optional(),
    homePhone: z.string().optional(),
    onlineLink: z.string().optional(),
  };

  // Apply specific validation based on option
  if (selectedOptionId === "local-store") {
    return z.object({
      ...baseSchema,
      itemName: z.string().min(1, { message: "Item name is required" }),
      totalWeight: z.string().min(1, { message: "Total weight is required" }),
      quantity: z.string().min(1, { message: "Quantity is required" }),
      storeAddress: z.string().min(5, { message: "Store address is required" }),
      storePhone: z.string().min(10, { message: "Store phone number is required" }),
    });
  } else if (selectedOptionId === "home-pickup") {
    return z.object({
      ...baseSchema,
      itemName: z.string().min(1, { message: "Item name is required" }),
      totalWeight: z.string().min(1, { message: "Total weight is required" }),
      quantity: z.string().min(1, { message: "Quantity is required" }),
      homeAddress: z.string().min(5, { message: "Home address is required" }),
      homePhone: z.string().min(10, { message: "Home phone number is required" }),
    });
  } else if (selectedOptionId === "online-order") {
    return z.object({
      ...baseSchema,
      itemName: z.string().min(1, { message: "Item name is required" }),
      quantity: z.string().min(1, { message: "Quantity is required" }),
      onlineLink: z.string().url({ message: "Please enter a valid URL" }).min(5, { message: "Online link is required" }),
    });
  } else {
    return z.object(baseSchema);
  }
};

// Map icon types to actual icon components
const iconMap: Record<SpecialOption["iconType"], LucideIcon> = {
  Store: Store,
  Home: HomeIcon,
  Online: Globe
}

// Transform special options to include actual icon components
const specialOptions = (specialOptionsData as SpecialOptionsData).specialOptions.map((option: SpecialOption) => ({
  ...option,
  icon: iconMap[option.iconType]
}))

// Get categories from JSON
const categories = (categoriesData as CategoriesData).categories

export default function Home() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState<typeof specialOptions[0] | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [showOrderConfirmationDialog, setShowOrderConfirmationDialog] = useState(false)
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const itemsPerPage = 12
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({})
  const [formSchema, setFormSchema] = useState(() => getFormSchema(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Order confirmation form schema
  const orderFormSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
    address: z.string().min(5, { message: "Please enter a valid address" }),
    preferredContact: z.string().min(1, { message: "Please select a preferred contact method" }),
    feedback: z.string().optional(),
  });
  
  const orderForm = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      preferredContact: "",
      feedback: "",
    },
  });

  // Update form schema when selected option changes
  useEffect(() => {
    const schema = getFormSchema(selectedOption?.id || null);
    setFormSchema(schema);
  }, [selectedOption]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      itemName: "",
      totalWeight: "",
      quantity: "",
      storeAddress: "",
      storePhone: "",
      homeAddress: "",
      homePhone: "",
      onlineLink: "",
    },
  });
  
  // Update form validation whenever formSchema changes
  useEffect(() => {
    form.clearErrors();
  }, [formSchema, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Set submitting state to show loading indicator
    setIsSubmitting(true);
    
    
    // Add the selected option to the cart with the form values
    if (selectedOption) {
      // Check if we have all required fields for the selected option
      let isValid = true;
      
      if (selectedOption.id === "local-store") {
        isValid = !!values.itemName && !!values.totalWeight && !!values.quantity && 
                 !!values.storeAddress && !!values.storePhone;
      } else if (selectedOption.id === "home-pickup") {
        isValid = !!values.itemName && !!values.totalWeight && !!values.quantity && 
                 !!values.homeAddress && !!values.homePhone;
      } else if (selectedOption.id === "online-order") {
        isValid = !!values.itemName && !!values.quantity && !!values.onlineLink;
      }
      
      if (!isValid) {
        // Let react-hook-form handle the validation display
        setIsSubmitting(false);
        return;
      }
      
      try {
        // Create a cart item from the special option
        const cartItem: CartItem = {
          id: selectedOption.id,
          name: selectedOption.name,
          price: 0, // Price will be determined later
          image: selectedOption.image || '/placeholder.png',
          quantity: 1,
          specialData: values
        };
        
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item.id === selectedOption.id);
          if (existingItem) {
            return prevCart.map(item =>
              item.id === selectedOption.id
                ? { ...item, quantity: item.quantity + 1, specialData: values }
                : item
            );
          }
          return [...prevCart, cartItem];
        });
        
        // Close the details modal
        setShowDetailsModal(false);
        
        // Open the cart drawer
        setIsCartDrawerOpen(true);
      } catch (error) {
        console.error("Error adding item to cart:", error);
      } finally {
        // Reset submitting state regardless of success or failure
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  }

  // Get all items when no category is selected
  const allItems = useMemo(() => {
    const items = selectedCategory
      ? categories.find(cat => cat.id === selectedCategory)?.items || []
      : [...specialOptions, ...categories.flatMap(cat => cat.items)]
    
    // Filter items based on search query
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [selectedCategory, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(allItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayItems = allItems.slice(startIndex, startIndex + itemsPerPage)

  // Add cart management functions
  const addToCart = (item: any) => {
    // Get quantity from local state or default to 1
    const quantity = itemQuantities[item.id] || 1
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      }
      return [...prevCart, { ...item, quantity }]
    })
    
    // Reset item quantity after adding to cart
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }))
    
    setIsCartDrawerOpen(true)
  }
  
  // Function to update local quantity (not the cart)
  const updateLocalQuantity = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const currentQuantity = prev[itemId] || 1
      const newQuantity = Math.max(1, currentQuantity + delta)
      return {
        ...prev,
        [itemId]: newQuantity
      }
    })
  }
  
  // Update quantity in the cart (for the cart drawer)
  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta)
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }
  
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const handleSpecialOptionClick = (option: typeof specialOptions[0]) => {
    // Reset form before showing the modal
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      preferredContact: "",
      itemName: "",
      totalWeight: "",
      quantity: "",
      storeAddress: "",
      storePhone: "",
      homeAddress: "",
      homePhone: "",
      onlineLink: "",
    });
    
    setSelectedOption(option)
    setShowDetailsModal(true)
  }

  const confirmOrder = () => {
    if (cart.length === 0) return
    
    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
    
    // Close the cart drawer and show order confirmation dialog
    setIsCartDrawerOpen(false)
    setShowOrderConfirmationDialog(true)
  }
  
  const handleOrderSubmit = async (values: z.infer<typeof orderFormSchema>) => {
    setIsOrderSubmitting(true)
    try {
      // Prepare order details
      const orderDetails = {
        ...values,
        cart,
        orderDate: new Date().toISOString(),
      }
      
      // Submit order to server
      const result = await submitOrder(orderDetails)
      
      if (result?.success) {
        // Save order details to localStorage
        localStorage.setItem("orderDetails", JSON.stringify(orderDetails))
        
        // Show success state
        setOrderSubmitted(true)
        
        // Clear cart after successful order
        setCart([])
        
        // Close dialog after 3 seconds
        setTimeout(() => {
          setShowOrderConfirmationDialog(false)
          setOrderSubmitted(false)
          orderForm.reset()
        }, 3000)
      } else {
        // Handle error
        console.error("Failed to submit order:", result?.message)
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      // You might want to show an error message to the user here
    } finally {
      setIsOrderSubmitting(false)
    }
  }
  
  // Calculate total price of items in cart
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      // For special items with specialData, show price as 0 for now
      // In a real app, you might calculate based on the special service
      const itemPrice = item.specialData ? 0 : item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cart]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="fixed top-4 left-4 z-50">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px]">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-xl font-semibold">Categories</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            {/* Quick Actions Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                Quick Actions
              </h3>
              <div className="space-y-1">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start h-9 text-sm font-medium"
                  onClick={() => {
                    setSelectedCategory(null)
                    setCurrentPage(1)
                    setIsSheetOpen(false)
                  }}
                >
                  All Items
                </Button>
              </div>
            </div>

            {/* Categories Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start h-9 text-sm font-medium"
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setCurrentPage(1)
                      setIsSheetOpen(false)
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Banner */}
          <Banner />
          
          {/* Header with Search and Pagination */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {selectedCategory 
                  ? categories.find(cat => cat.id === selectedCategory)?.name 
                  : "All Items"}
              </h1>
              <span className="text-muted-foreground">
                ({allItems.length} items)
              </span>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-8"
                />
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayItems.map((item) => {
              const cartItem = cart.find(i => i.id === item.id)
              return (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center text-sm">
                      {'iconType' in item ? (
                        'image' in item ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <item.icon className="h-8 w-8" />
                        )
                      ) : (
                        item.name
                      )}
                    </div>
                  </div>
                  <CardHeader className="p-3">
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm truncate">{item.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            {'iconType' in item ? null : (
                              <>
                                {item.weight && (
                                  <div className="flex items-center text-xs text-muted-foreground" title="Weight">
                                    <Scale className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{item.weight}</span>
                                  </div>
                                )}
                                {item.packSize && (
                                  <div className="flex items-center text-xs text-muted-foreground ml-2" title="Pack Size">
                                    <Package className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{item.packSize}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          <CardDescription className="text-xs mt-1">
                            {'iconType' in item ? (
                              <>
                                {item.description}
                                <div className="mt-1">{item.price} (shared later)</div>
                              </>
                            ) : `$${item.price.toFixed(2)}`}
                          </CardDescription>
                        </div>
                        {'iconType' in item ? null : (
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0"
                                onClick={() => updateLocalQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{itemQuantities[item.id] || 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0"
                                onClick={() => updateLocalQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    {'iconType' in item ? (
                      <Button 
                        className="w-full h-8 text-sm"
                        onClick={() => handleSpecialOptionClick(item)}
                      >
                        Select Option
                      </Button>
                    ) : (
                      <Button 
                        className="w-full h-8 text-sm"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOption?.name}</DialogTitle>
            <DialogDescription>
              Please fill out the details below to add this special item to your cart.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {selectedOption?.id === "local-store" ? (
                <>
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
                    name="totalWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Weight</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total weight" {...field} />
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
                          <Input placeholder="Enter quantity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                        <FormLabel>Store Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter store phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : selectedOption?.id === "home-pickup" ? (
                <>
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
                    name="totalWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Weight</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total weight" {...field} />
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
                          <Input placeholder="Enter quantity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your home address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homePhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your home phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : selectedOption?.id === "online-order" ? (
                <>
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
                    name="totalWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Weight</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total weight" {...field} />
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
                          <Input placeholder="Enter quantity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="onlineLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Online Product Link</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the product URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Contact Method</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred contact method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Text">Text Message</SelectItem>
                              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                              <SelectItem value="Call">Phone Call</SelectItem>
                              <SelectItem value="Email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Adding to Cart..." : "Add to Cart"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cart Drawer */}
      <Drawer open={isCartDrawerOpen} onOpenChange={setIsCartDrawerOpen}>
        <DrawerContent side="right" className="px-4 max-h-[100vh] w-[350px]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </DrawerTitle>
            <DrawerDescription>
              {cart.length === 0 
                ? "Your cart is empty" 
                : `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart`}
            </DrawerDescription>
          </DrawerHeader>
          
          {cart.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto py-2 space-y-4">
                {cart.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex items-center p-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {item.specialData ? (
                            <div className="text-xs text-muted-foreground">
                              {item.specialData.itemName && <div>Item: {item.specialData.itemName}</div>}
                              {item.specialData.quantity && <div>Qty: {item.specialData.quantity}</div>}
                              {item.specialData.totalWeight && <div>Weight: {item.specialData.totalWeight}</div>}
                            </div>
                          ) : (
                            <>
                              {item.weight && (
                                <div className="flex items-center text-xs text-muted-foreground" title="Weight">
                                  <Scale className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{item.weight}</span>
                                </div>
                              )}
                              {item.packSize && (
                                <div className="flex items-center text-xs text-muted-foreground ml-2" title="Pack Size">
                                  <Package className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{item.packSize}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm">
                            {item.specialData 
                              ? "Price TBD" 
                              : `$${(item.price * item.quantity).toFixed(2)}`}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-7 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 p-0"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 p-0 text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <DrawerFooter>
                <div className="flex items-center justify-between py-2 font-medium">
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button onClick={confirmOrder} className="w-full">
                  Confirm Order
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCartDrawerOpen(false)} 
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </DrawerFooter>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Your cart is empty. Add some items to get started.
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <Button
          onClick={() => setIsCartDrawerOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[0.7rem] font-medium text-primary-foreground">
            {cart.reduce((total, item) => total + item.quantity, 0)}
          </span>
        </Button>
      )}

      {/* Order Confirmation Dialog */}
      <Dialog open={showOrderConfirmationDialog} onOpenChange={setShowOrderConfirmationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Please provide your contact information to complete the order.
            </DialogDescription>
          </DialogHeader>
          
          {!orderSubmitted ? (
            <Form {...orderForm}>
              <form onSubmit={orderForm.handleSubmit(handleOrderSubmit)} className="space-y-4">
                <FormField
                  control={orderForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your delivery address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="preferredContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Contact Method</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preferred contact method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Text">Text Message</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            <SelectItem value="Call">Phone Call</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter any feedback" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isOrderSubmitting}>
                  {isOrderSubmitting ? "Submitting..." : "Submit Order"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="text-xl font-semibold text-center">Thank you for your order!</h3>
              <p className="text-center text-muted-foreground">
                Our team will reach out to you on the provided number or email soon with the delivery date.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


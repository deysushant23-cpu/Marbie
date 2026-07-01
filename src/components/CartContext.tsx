"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CustomerAuthModal from "@/components/CustomerAuthModal";

export interface CartItem {
  id: string | number;
  originalProductId?: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  isGift?: boolean;
  giftLocation?: string;
}

export interface CustomerUser {
  name: string;
  email?: string;
  phone?: string;
  authMethod?: "google" | "phone";
  location?: string;
}

interface CartContextType {
  items: CartItem[];
  wishlistItems: CartItem[];
  count: number;
  total: number;
  customerUser: CustomerUser | null;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  requireCustomerAuth: (callback: () => void) => void;
  loginCustomer: (user: CustomerUser) => void;
  logoutCustomer: () => void;
  updateCustomerLocation: (location: string) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  removeFromCart: (id: string | number) => void;
  moveToWishlist: (id: string | number) => void;
  removeFromWishlist: (id: string | number) => void;
  addToWishlist: (item: Omit<CartItem, 'quantity'>) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({ 
  items: [],
  wishlistItems: [],
  count: 0, 
  total: 0,
  customerUser: null,
  showAuthModal: false,
  setShowAuthModal: () => {},
  requireCustomerAuth: () => {},
  loginCustomer: () => {},
  logoutCustomer: () => {},
  updateCustomerLocation: () => {},
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  moveToWishlist: () => {},
  removeFromWishlist: () => {},
  addToWishlist: () => {},
  clearCart: () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<CartItem[]>([]);
  
  // Customer Auth State
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  // Load wishlist & customer user from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("marbie_cart");
    if (savedCart) {
      try { setItems(JSON.parse(savedCart)); } catch {}
    }
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try { setWishlistItems(JSON.parse(savedWishlist)); } catch {}
    }
    const savedCustomer = localStorage.getItem("marbie_customer_user");
    if (savedCustomer) {
      try { setCustomerUser(JSON.parse(savedCustomer)); } catch {}
    }
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const requireCustomerAuth = (callback: () => void) => {
    if (customerUser || session?.user) {
      callback();
    } else {
      setPendingAuthAction(() => callback);
      setShowAuthModal(true);
    }
  };

  const loginCustomer = (user: CustomerUser) => {
    setCustomerUser(user);
    try { localStorage.setItem("marbie_customer_user", JSON.stringify(user)); } catch {}
    setShowAuthModal(false);
    if (pendingAuthAction) {
      pendingAuthAction();
      setPendingAuthAction(null);
    }
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    try { localStorage.removeItem("marbie_customer_user"); } catch {}
  };

  const updateCustomerLocation = (location: string) => {
    if (!customerUser) return;
    const updated = { ...customerUser, location };
    setCustomerUser(updated);
    try { localStorage.setItem("marbie_customer_user", JSON.stringify(updated)); } catch {}
  };

  // Protected Action: Add To Cart
  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    requireCustomerAuth(() => {
      setItems((prev) => {
        // Create unique ID for gifts so they don't merge incorrectly with non-gifts
        const isExistingNormalItem = !newItem.isGift && prev.find(item => item.id === newItem.id && !item.isGift);
        const uniqueId = newItem.isGift ? `${newItem.id}_gift_${Date.now()}` : newItem.id;
        
        if (isExistingNormalItem) {
          return prev.map(item => 
            item.id === newItem.id && !item.isGift
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...newItem, id: uniqueId, originalProductId: newItem.id, quantity: 1 }];
      });
      router.push("/cart");
    });
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    setItems((prev) => 
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  };

  const removeFromCart = (id: string | number) => {
    setItems((prev) => prev.filter(item => item.id !== id));
  };

  // Protected Action: Move to Wishlist
  const moveToWishlist = (id: string | number) => {
    requireCustomerAuth(() => {
      const itemToMove = items.find(item => item.id === id);
      if (itemToMove) {
        setWishlistItems((prev) => {
          const originalId = itemToMove.originalProductId || itemToMove.id;
          if (prev.find(item => item.id === originalId)) return prev;
          const newWishlist = [...prev, { ...itemToMove, id: originalId }];
          localStorage.setItem("wishlist", JSON.stringify(newWishlist));
          return newWishlist;
        });
        removeFromCart(id);
      }
    });
  };

  const removeFromWishlist = (id: string | number) => {
    setWishlistItems((prev) => {
      const newWishlist = prev.filter(item => item.id !== id);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const addToWishlist = (newItem: Omit<CartItem, 'quantity'>) => {
    requireCustomerAuth(() => {
      setWishlistItems((prev) => {
        if (prev.find(item => item.id === newItem.id)) return prev;
        const newWishlist = [...prev, { ...newItem, quantity: 1 }];
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
        return newWishlist;
      });
    });
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ 
      items, wishlistItems, count, total, 
      customerUser, showAuthModal, setShowAuthModal, requireCustomerAuth, loginCustomer, logoutCustomer, updateCustomerLocation,
      addToCart, updateQuantity, removeFromCart, moveToWishlist, removeFromWishlist, addToWishlist, clearCart 
    }}>
      {children}
      <CustomerAuthModal />
    </CartContext.Provider>
  );
};

import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type CartItemWithProduct = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  error: Error | null;
  addToCart: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  decrementCart: (productId: number) => void;
  clearCart: () => void;
  isUpdating: boolean;
  calculateTotal: () => number;
  totalItems: number;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    data: cartItems = [],
    error,
    isLoading,
  } = useQuery<CartItemWithProduct[], Error>({
    queryKey: ["/api/cart"],
    // Mode actualisé: on maintient le panier même sans connexion
    // mais en utilisant un traitement spécial pour les erreurs 401
    queryFn: getQueryFn({ on401: "returnData" }),
  });
  
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      try {
        // Pour la décrémentation, on envoie la quantité négative
        const payload = { productId, quantity };
        const res = await apiRequest("POST", "/api/cart", payload);
        return await res.json();
      } catch (error) {
        // En cas d'erreur, on renvoie le panier actuel
        return queryClient.getQueryData<CartItemWithProduct[]>(["/api/cart"]) || [];
      }
    },
    onSuccess: (updatedCart, variables) => {
      queryClient.setQueryData(["/api/cart"], updatedCart);
      // Ne pas afficher la notification si on décrémente la quantité
      if (variables.quantity > 0) {
        toast({
          title: "Produit ajouté",
          description: "Le produit a été ajouté à votre panier.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      try {
        const res = await apiRequest("DELETE", `/api/cart/${productId}`);
        return await res.json();
      } catch (error) {
        // En cas d'erreur, on renvoie un tableau vide pour éviter les erreurs
        return [];
      }
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["/api/cart"], updatedCart);
      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré de votre panier.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const decrementCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      try {
        // Récupérer le panier actuel
        const currentCart = queryClient.getQueryData<CartItemWithProduct[]>(["/api/cart"]) || [];
        const existingItem = currentCart.find(item => item.product.id === productId);
        
        if (!existingItem || existingItem.quantity <= 1) {
          return currentCart;
        }
        
        // Optimistic update: on met à jour le panier côté client d'abord
        const newQuantity = existingItem.quantity - 1;
        
        // Créer une copie du panier pour l'optimistic update
        const optimisticCart = currentCart.map(item => {
          if (item.product.id === productId) {
            return {
              ...item,
              quantity: newQuantity
            };
          }
          return item;
        });
        
        // Mettre à jour le panier côté client immédiatement
        queryClient.setQueryData(["/api/cart"], optimisticCart);
        
        // Supprimer l'item du panier
        await apiRequest("DELETE", `/api/cart/${productId}`);
        
        // Puis ajouter à nouveau avec la nouvelle quantité
        const res = await apiRequest("POST", "/api/cart", { 
          productId, 
          quantity: newQuantity
        });
        
        return await res.json();
      } catch (error) {
        // En cas d'erreur, on renvoie le panier actuel sans modification
        console.error("Erreur lors de la décrémentation:", error);
        return queryClient.getQueryData<CartItemWithProduct[]>(["/api/cart"]) || [];
      }
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["/api/cart"], updatedCart);
      // Pas de notification pour la décrémentation
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiRequest("DELETE", "/api/cart");
      } catch (error) {
        // Même si l'API échoue, on vide quand même le panier côté client
        // (pour gérer le cas des utilisateurs non connectés)
        console.log("Erreur lors du vidage du panier:", error);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/cart"], []);
      toast({
        title: "Panier vidé",
        description: "Votre panier a été vidé.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const addToCart = (productId: number, quantity: number) => {
    addToCartMutation.mutate({ productId, quantity });
  };
  
  const removeFromCart = (productId: number) => {
    removeFromCartMutation.mutate(productId);
  };
  
  const decrementCart = (productId: number) => {
    decrementCartMutation.mutate(productId);
  };
  
  const clearCart = () => {
    clearCartMutation.mutate();
  };
  
  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => {
      // Apply discount if any
      const price = item.product.discount && item.product.discount > 0 
        ? Math.round(item.product.price * (1 - item.product.discount / 100)) 
        : item.product.price;
      
      return total + (price * item.quantity);
    }, 0);
  };
  
  const isUpdating = addToCartMutation.isPending || 
                     removeFromCartMutation.isPending || 
                     clearCartMutation.isPending;
  
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        decrementCart,
        clearCart,
        isUpdating,
        calculateTotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

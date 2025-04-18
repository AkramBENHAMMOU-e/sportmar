import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import CartItem from "./cart-item";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { ShoppingBasket, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { SafeLinkButton } from "@/components/ui/safe-link-button";

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CartDrawer({ isOpen, setIsOpen }: CartDrawerProps) {
  const { user } = useAuth();
  const { cartItems, isLoading, calculateTotal, totalItems, isUpdating } = useCart();
  
  const handleCloser = () => {
    setIsOpen(false);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" data-radix-scroll-lock-nonarria-hidden="true">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBasket className="mr-2 h-5 w-5" />
            Mon Panier ({totalItems})
          </SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBasket className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-6">Votre panier est vide</p>
            <SafeLinkButton 
              href="/products"
              onBeforeNavigate={handleCloser}
              delay={100}
            >
              Découvrir les produits
            </SafeLinkButton>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto my-6 pr-1">
              {cartItems.map((item) => (
                <CartItem 
                  key={item.product.id} 
                  product={item.product} 
                  quantity={item.quantity}
                  onClose={handleCloser}
                />
              ))}
            </div>
            
            <div className="space-y-4">
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              
              {!user ? (
                <div className="space-y-2">
                  <SafeLinkButton 
                    href="/auth"
                    className="w-full"
                    onBeforeNavigate={handleCloser}
                    delay={100}
                  >
                    Se connecter pour commander
                  </SafeLinkButton>
                </div>
              ) : (
                <div className="space-y-2">
                  <SafeLinkButton 
                    href="/cart"
                    variant="outline"
                    className="w-full"
                    onBeforeNavigate={handleCloser}
                    delay={100}
                  >
                    Voir le panier
                  </SafeLinkButton>
                  
                  <SafeLinkButton 
                    href="/checkout"
                    className="w-full"
                    onBeforeNavigate={handleCloser}
                    delay={100}
                  >
                    Commander
                  </SafeLinkButton>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

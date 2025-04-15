import { Product } from "@shared/schema";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, calculateDiscountedPrice } from "@/lib/utils";
import { SafeLink } from "@/components/ui/safe-link";

interface CartItemProps {
  product: Product;
  quantity: number;
  showControls?: boolean;
  onClose?: () => void;
}

export default function CartItem({ 
  product, 
  quantity, 
  showControls = true,
  onClose
}: CartItemProps) {
  const { addToCart, removeFromCart, decrementCart } = useCart();
  
  const handleIncrease = () => {
    addToCart(product.id, 1);
  };
  
  const handleDecrease = () => {
    if (quantity > 1) {
      decrementCart(product.id);
    } else {
      handleRemove();
    }
  };
  
  const handleRemove = () => {
    removeFromCart(product.id);
  };
  
  const productLink = `/products/${product.id}`;
  
  const discountedPrice = product.discount && product.discount > 0 
    ? calculateDiscountedPrice(product.price, product.discount) 
    : product.price;
  
  const totalPrice = discountedPrice * quantity;
  
  return (
    <div className="flex items-center space-x-3 border-b pb-3">
      <SafeLink href={productLink} onClick={onClose}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-16 h-16 object-cover rounded"
        />
      </SafeLink>
      <div className="flex-1">
        <SafeLink href={productLink} onClick={onClose}>
          <h4 className="text-sm font-medium text-gray-800">{product.name}</h4>
        </SafeLink>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <div className="flex items-center">
            <span>{quantity} x {formatPrice(discountedPrice)}</span>
            {product.discount && product.discount > 0 && (
              <span className="text-xs line-through ml-1 text-gray-400">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span className="font-semibold">{formatPrice(totalPrice)}</span>
        </div>
        
        {showControls && (
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-6 w-6 rounded-full"
                onClick={handleDecrease}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="mx-2 min-w-[20px] text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-6 w-6 rounded-full"
                onClick={handleIncrease}
                disabled={quantity >= product.stock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

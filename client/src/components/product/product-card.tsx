import { Product } from "@shared/schema";
import { Star, ShoppingCart, Star as StarOutline } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, calculateDiscountedPrice } from "@/lib/utils";
import { SafeLink } from "@/components/ui/safe-link";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };
  
  const renderStars = (rating: number = 4) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="text-amber-500 fill-amber-500 h-4 w-4" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<Star key={i} className="text-amber-500 fill-amber-500 h-4 w-4" />);
      } else {
        stars.push(<Star key={i} className="text-amber-500 h-4 w-4" />);
      }
    }
    return stars;
  };
  
  const discount = product.discount || 0;
  
  const discountedPrice = discount > 0 
    ? calculateDiscountedPrice(product.price, discount) 
    : product.price;
  
  return (
    <SafeLink href={`/products/${product.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 product-card h-full cursor-pointer">
        <div className="relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-36 sm:h-48 object-cover" 
          />
          {product.featured && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              Populaire
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Stock limité
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Rupture de stock</span>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center mb-2 sm:mb-3">
            <div className="flex text-accent">
              {renderStars()}
            </div>
            <span className="text-gray-500 text-xs sm:text-sm ml-1">(24 avis)</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-gray-800">
                {formatPrice(discountedPrice)}
              </span>
              {discount > 0 && (
                <span className="text-gray-500 text-xs sm:text-sm line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white text-xs px-2 py-1 h-auto sm:h-9 sm:px-3 sm:py-2"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">Ajouter</span>
              <span className="inline xs:hidden">+</span>
            </Button>
          </div>
        </div>
      </div>
    </SafeLink>
  );
}

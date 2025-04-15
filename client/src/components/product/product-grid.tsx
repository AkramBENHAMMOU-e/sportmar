import { Product } from "@shared/schema";
import ProductCard from "./product-card";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

export default function ProductGrid({ 
  products, 
  isLoading = false, 
  error = null,
  emptyMessage = "Aucun produit trouvé"
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg mb-2">Une erreur est survenue</p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

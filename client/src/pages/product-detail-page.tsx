import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronRight,
  ShoppingCart,
  Minus,
  Plus,
  CheckCircle,
  XCircle,
  Star,
  Share2,
  Truck,
  ShieldCheck,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import ProductGrid from "@/components/product/product-grid";
import { formatPrice, calculateDiscountedPrice } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { addToCart, isUpdating } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { 
    data: product, 
    isLoading: isProductLoading, 
    error: productError 
  } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  // Fetch related products (same category)
  const { 
    data: relatedProducts = [], 
    isLoading: isRelatedLoading 
  } = useQuery<Product[]>({
    queryKey: [product ? `/api/products/category/${product.category}` : null],
    enabled: !!product,
  });

  const filteredRelatedProducts = relatedProducts
    .filter(p => p.id !== Number(id))
    .slice(0, 4);

  const handleQuantityDecrease = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity(prev => Math.min(product?.stock || 1, prev + 1));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  // Loading state
  if (isProductLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-6xl">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 h-96 bg-gray-200 rounded"></div>
            <div className="md:w-1/2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertDescription>
            Le produit demandé n'a pas pu être chargé. Veuillez réessayer plus tard.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate("/products")}>
            Retour aux produits
          </Button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount > 0 
    ? calculateDiscountedPrice(product.price, product.discount) 
    : product.price;
  
  const totalPrice = discountedPrice * quantity;

  // Get subcategory label
  const getSubcategoryLabel = (subcategory: string) => {
    const allSubcategories = [
      ...subcategories.supplement,
      ...subcategories.equipment,
    ];
    const found = allSubcategories.find((s) => s.value === subcategory);
    return found ? found.label : subcategory;
  };

  const subcategories = {
    supplement: [
      { label: "Protéines", value: "proteine" },
      { label: "Vitamines", value: "vitamine" },
      { label: "Brûleurs de graisse", value: "bruleur" },
      { label: "Acides aminés", value: "acides-amines" },
      { label: "Performance", value: "performance" },
    ],
    equipment: [
      { label: "Musculation", value: "musculation" },
      { label: "Cardio", value: "cardio" },
      { label: "Accessoires", value: "accessoires" },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products/category/${product.category}`}>
              {product.category === "supplement" ? "Compléments" : "Équipements"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products/subcategory/${product.subcategory}`}>
              {getSubcategoryLabel(product.subcategory)}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{product.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Product Details */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2">
          <div className="mb-2 flex items-center gap-2">
            {product.featured && (
              <Badge variant="default" className="bg-primary text-white">Populaire</Badge>
            )}
            {product.discount > 0 && (
              <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                -{product.discount}% de réduction
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${i < 4 ? "fill-current" : ""}`} 
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm ml-2">(24 avis)</span>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-4">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Partager le produit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mb-4">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-800">
                {formatPrice(discountedPrice)}
              </span>
              {product.discount > 0 && (
                <span className="text-gray-500 text-lg line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Tous les prix incluent la TVA
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <Separator className="my-4" />

          {/* Stock Status */}
          <div className="flex items-center mb-6">
            {product.stock > 0 ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>En stock ({product.stock} disponibles)</span>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <XCircle className="h-5 w-5 mr-2" />
                <span>Rupture de stock</span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center mb-6">
              <span className="mr-4 text-gray-700">Quantité:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleQuantityDecrease}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-none"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center">{quantity}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleQuantityIncrease}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10 rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={handleAddToCart} 
              className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6"
              disabled={product.stock === 0 || isUpdating}
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
            </Button>
            
            {product.stock > 0 && (
              <div className="text-gray-700">
                Total: <span className="font-bold">{formatPrice(totalPrice)}</span>
              </div>
            )}
          </div>

          {/* Shipping and Returns */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Truck className="h-4 w-4 mr-2 text-primary" />
              <span>Livraison rapide dans tout le Maroc</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
              <span>Garantie de qualité sur tous nos produits</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              <span>Une question ? Contactez-nous à ayman2202ayman@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-12">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
            <TabsTrigger value="description" className="rounded-none pb-2 pt-2 px-4">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="rounded-none pb-2 pt-2 px-4">
              Spécifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none pb-2 pt-2 px-4">
              Avis (24)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <p>
                Nos produits sont sélectionnés avec soin pour vous garantir une qualité optimale.
                Nous travaillons avec les meilleures marques du secteur pour vous offrir des produits
                efficaces et sûrs.
              </p>
              <p>
                Ce produit est parfait pour les athlètes cherchant à améliorer leurs performances
                et atteindre leurs objectifs plus rapidement. Fabriqué avec des ingrédients de haute qualité,
                il offre des résultats visibles et durables.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-3">Caractéristiques principales</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>Catégorie: {product.category === "supplement" ? "Compléments alimentaires" : "Équipements sportifs"}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>Sous-catégorie: {getSubcategoryLabel(product.subcategory)}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>Référence: FITM-{product.id.toString().padStart(4, '0')}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-3">Informations supplémentaires</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>Stock disponible: {product.stock} unités</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>Garantie: 30 jours satisfait ou remboursé</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>Expédition sous 24-48h ouvrées</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < 4 ? "fill-current" : ""}`} 
                    />
                  ))}
                </div>
                <span className="text-gray-700 ml-2">4.0 sur 5 (24 avis)</span>
              </div>
              
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Cette fonctionnalité sera disponible prochainement.</p>
                <Button>Soyez le premier à laisser un avis</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {filteredRelatedProducts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Produits similaires</h2>
            <Button 
              variant="link" 
              className="text-primary"
              asChild
            >
              <a href={`/products/category/${product.category}`}>
                Voir plus <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>
          
          <ProductGrid 
            products={filteredRelatedProducts} 
            isLoading={isRelatedLoading}
          />
        </div>
      )}
    </div>
  );
}

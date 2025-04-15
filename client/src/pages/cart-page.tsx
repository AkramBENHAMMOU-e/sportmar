import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Trash2, 
  ShoppingCart, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import CartItem from "@/components/cart/cart-item";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { SafeLink } from "@/components/ui/safe-link";

export default function CartPage() {
  const { cartItems, isLoading, error, calculateTotal, clearCart, totalItems, addToCart, removeFromCart, decrementCart } = useCart();
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement de votre panier...</h2>
          <p className="text-gray-600">Merci de patienter un instant</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur est survenue lors du chargement de votre panier. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">
            Vous n'avez aucun article dans votre panier. Découvrez nos produits et commencez à ajouter des articles à votre panier.
          </p>
          <Button asChild>
            <SafeLink href="/products">Explorer les produits</SafeLink>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = calculateTotal();
  const shipping = subtotal > 50000 ? 0 : 3000; // Free shipping for orders over 500 MAD
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Votre Panier</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Articles ({totalItems})</CardTitle>
            </CardHeader>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Produit</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => {
                    const price = item.product.discount && item.product.discount > 0 
                      ? formatPrice(Math.round(item.product.price * (1 - item.product.discount / 100)))
                      : formatPrice(item.product.price);
                    
                    const itemTotal = item.product.discount && item.product.discount > 0 
                      ? formatPrice(Math.round(item.product.price * (1 - item.product.discount / 100) * item.quantity))
                      : formatPrice(item.product.price * item.quantity);

                    return (
                      <TableRow key={item.product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <SafeLink href={`/products/${item.product.id}`} className="font-medium hover:text-primary">
                                {item.product.name}
                              </SafeLink>
                              <p className="text-gray-500 text-sm">{item.product.subcategory}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{price}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => item.quantity > 1 && decrementCart(item.product.id)}
                              disabled={item.quantity <= 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => addToCart(item.product.id, 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {itemTotal}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile view */}
            <div className="md:hidden p-4 space-y-4">
              {cartItems.map((item) => (
                <CartItem 
                  key={item.product.id} 
                  product={item.product} 
                  quantity={item.quantity} 
                />
              ))}
            </div>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <SafeLink href="/products">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Continuer mes achats
                </SafeLink>
              </Button>
              <Button variant="ghost" onClick={() => clearCart()} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Vider le panier
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de livraison</span>
                <span className="font-medium">
                  {shipping === 0 ? 
                    <span className="text-green-600">Gratuit</span> : 
                    formatPrice(shipping)
                  }
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">{formatPrice(total)}</span>
              </div>
              
              {shipping > 0 && (
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ajoutez {formatPrice(50000 - subtotal)} d'articles supplémentaires pour bénéficier de la livraison gratuite.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg" asChild>
                <SafeLink href="/checkout">
                  Passer à la caisse
                  <ChevronRight className="ml-2 h-4 w-4" />
                </SafeLink>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

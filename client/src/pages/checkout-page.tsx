import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Check, 
  CheckCircle, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";
import { SafeLink } from "@/components/ui/safe-link";

// Define checkout form schema
const checkoutSchema = z.object({
  customerName: z.string().min(3, "Le nom complet est requis"),
  customerEmail: z.string().email("Adresse email invalide"),
  customerPhone: z.string().min(8, "Numéro de téléphone invalide"),
  shippingAddress: z.string().min(10, "L'adresse de livraison est requise et doit être complète"),
  paymentMethod: z.enum(["cash", "card", "bank"]),
  additionalNotes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const { user } = useAuth();
  const { cartItems, calculateTotal, isLoading: isCartLoading, clearCart } = useCart();
  const [_, navigate] = useLocation();

  // Redirect if cart is empty
  useEffect(() => {
    if (!isCartLoading && cartItems.length === 0 && !orderSuccess) {
      navigate("/cart");
    }
  }, [cartItems, isCartLoading, orderSuccess, navigate]);

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.fullName || "",
      customerEmail: user?.email || "",
      customerPhone: user?.phoneNumber || "",
      shippingAddress: user?.address || "",
      paymentMethod: "cash",
      additionalNotes: "",
    },
  });

  // Calculate totals
  const subtotal = calculateTotal();
  const shipping = subtotal > 50000 ? 0 : 3000; // Free shipping for orders over 500 MAD
  const total = subtotal + shipping;

  // Order creation mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      setIsSubmitting(true);
      // Sauvegarde du total avant de vider le panier
      setOrderTotal(total);
      const res = await apiRequest("POST", "/api/orders", {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        userId: user?.id // facultatif - sera null si utilisateur non connecté
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setOrderSuccess(true);
      setOrderId(data.id);
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Commande créée avec succès!",
        description: `Votre commande #${data.id} a été créée.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la création de la commande",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  const onSubmit = (data: CheckoutFormValues) => {
    createOrderMutation.mutate(data);
  };

  // If order was successful, show success message
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-100 text-green-800 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Commande confirmée !</h1>
          <p className="text-gray-600 mb-8">
            Merci pour votre commande. Votre commande #{orderId} a été créée avec succès et est en cours de traitement.
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Détails de la commande</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Numéro de commande:</span>
              <span className="font-medium">#{orderId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Statut:</span>
              <span className="font-medium text-amber-600">En attente</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold">{formatPrice(orderTotal)}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <SafeLink href="/orders">Voir mes commandes</SafeLink>
            </Button>
            <Button variant="outline" asChild>
              <SafeLink href="/">Retour à l'accueil</SafeLink>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement...</h2>
          <p className="text-gray-600">Préparation de votre commande</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Finaliser la commande</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout form */}
        <div className="lg:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Vos coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom et prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre-email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="+212 6XX XXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    Adresse de livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse complète</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Entrez votre adresse complète de livraison (rue, ville, code postal, pays)" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Méthode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="cash" id="cash" />
                              <Label htmlFor="cash">Paiement à la livraison</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="card" id="card" />
                              <Label htmlFor="card">Carte bancaire</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="bank" id="bank" />
                              <Label htmlFor="bank">Virement bancaire</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notes supplémentaires</CardTitle>
                  <CardDescription>Vous pouvez ajouter des instructions pour la livraison (optionnel)</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            placeholder="Instructions spéciales pour la livraison ou autres remarques" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order items summary */}
                <Accordion type="single" collapsible defaultValue="items">
                  <AccordionItem value="items">
                    <AccordionTrigger>
                      <span className="font-medium">Articles ({cartItems.length})</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 max-h-80 overflow-y-auto py-2">
                        {cartItems.map((item) => (
                          <div key={item.product.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded overflow-hidden mr-2">
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.product.name}</p>
                                <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-medium">
                              {formatPrice(
                                item.product.discount && item.product.discount > 0
                                  ? Math.round(item.product.price * (1 - item.product.discount / 100) * item.quantity)
                                  : item.product.price * item.quantity
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <Separator />
                
                {/* Cost summary */}
                <div className="space-y-2">
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
                </div>
                
                {/* Payment security note */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Vos informations personnelles sont sécurisées. Nous ne stockons jamais vos données de paiement.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="lg"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting || cartItems.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Confirmer la commande
                </Button>
                <Button variant="outline" asChild>
                  <SafeLink href="/cart">Revenir au panier</SafeLink>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Delivery info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <Truck className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      Livraison standard: 2-5 jours ouvrables (gratuite à partir de 500 MAD d'achat)
                    </p>
                  </div>
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      Les commandes passées avant 14h sont expédiées le jour même (jours ouvrables uniquement)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

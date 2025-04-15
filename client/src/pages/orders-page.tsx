import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SafeLink } from "@/components/ui/safe-link";
import { 
  Package, 
  ChevronRight, 
  Eye, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  ShoppingBag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Order, OrderItem, Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice, formatDate, translateStatus, getStatusColor } from "@/lib/utils";

export default function OrdersPage() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<(OrderItem & { product?: Product })[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  // Fetch orders
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  // Fetch order details when order is selected
  const { isLoading: isOrderDetailLoading } = useQuery({
    queryKey: [`/api/orders/${selectedOrder?.id}`],
    enabled: !!selectedOrder,
    onSuccess: (data) => {
      if (data) {
        setOrderItems(data.items);
      }
    },
  });

  // Filter orders
  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(order => order.status === filter);

  // View order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrder(null);
    setOrderItems([]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chargement de vos commandes...</h2>
          <p className="text-gray-600">Merci de patienter un instant</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur est survenue lors du chargement de vos commandes. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Vous n'avez pas encore de commandes</h1>
          <p className="text-gray-600 mb-8">
            Vous n'avez pas encore passé de commande. Explorez notre boutique pour découvrir nos produits.
          </p>
          <Button asChild>
            <SafeLink href="/products">Explorer les produits</SafeLink>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mes Commandes</h1>
        
        <div className="flex items-center">
          <span className="mr-2 text-gray-600">Filtrer par:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="shipped">Expédiée</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune commande ne correspond au filtre sélectionné.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {/* Desktop view */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° de commande</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {translateStatus(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Commande #{order.id}</CardTitle>
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {translateStatus(order.status)}
                    </Badge>
                  </div>
                  <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => handleViewOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir les détails
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Détails de la commande #{selectedOrder.id}
                </DialogTitle>
                <DialogDescription>
                  Commande passée le {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Order Status */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Statut:</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                    {translateStatus(selectedOrder.status)}
                  </Badge>
                </div>
                
                <Separator />
                
                {/* Order Items */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Articles commandés</h3>
                  
                  {isOrderDetailLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : orderItems.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Aucun détail disponible pour cette commande.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded overflow-hidden mr-3">
                              {item.product?.imageUrl ? (
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product?.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.product?.name || `Produit #${item.productId}`}</p>
                              <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-medium">
                            {formatPrice(item.priceAtPurchase * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Order Summary */}
                <div>
                  <h3 className="font-bold text-lg mb-3">Récapitulatif</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adresse de livraison:</span>
                      <span className="text-right max-w-xs">{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Fermer
                  </Button>
                  <Button asChild>
                    <SafeLink href="/products">
                      Commander à nouveau
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </SafeLink>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

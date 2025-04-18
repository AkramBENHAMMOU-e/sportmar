import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ShoppingCart, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/admin/sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Order, OrderItem, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatDate, translateStatus, getStatusColor } from "@/lib/utils";

// Pagination settings
const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  // Fetch all orders
  const { 
    data: orders = [], 
    isLoading, 
    error 
  } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Fetch order details when order is selected
  const { 
    data: orderDetails,
    isLoading: isOrderDetailLoading
  } = useQuery({
    queryKey: [`/api/orders/${selectedOrder?.id}`],
    enabled: !!selectedOrder,
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${orderId}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${selectedOrder?.id}`] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du statut: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle viewing order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    if (selectedOrder) {
      updateOrderStatusMutation.mutate({ orderId: selectedOrder.id, status });
    }
  };

  // Filter orders
  const filteredOrders = orders
    .filter(order => {
      // Search by order ID or shipping address
      const searchTarget = `${order.id} ${order.shippingAddress}`.toLowerCase();
      return searchTarget.includes(searchQuery.toLowerCase());
    })
    .filter(order => statusFilter === "all" || order.status === statusFilter);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders
    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des commandes</h1>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par numéro de commande ou adresse..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
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

          {/* Orders List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Une erreur est survenue lors du chargement des commandes. Veuillez réessayer.
              </AlertDescription>
            </Alert>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande trouvée</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all" 
                  ? "Aucune commande ne correspond à vos critères de recherche." 
                  : "Aucune commande n'a encore été passée."}
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>
                  {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° de commande</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            Client #{order.userId}
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                              {order.shippingAddress}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(order.status)}
                              <Badge className={`${getStatusColor(order.status)} text-white`}>
                                {translateStatus(order.status)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatPrice(order.totalAmount)}</div>
                          </TableCell>
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
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Affichage de {((page - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(page * ITEMS_PER_PAGE, filteredOrders.length)} sur {filteredOrders.length} commandes
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {page} sur {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Detail Dialog */}
          <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              {selectedOrder && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Commande #{selectedOrder.id}
                    </DialogTitle>
                    <DialogDescription>
                      Passée le {formatDate(selectedOrder.createdAt)}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Order Status Controls */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-700 mb-3">Statut de la commande</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={selectedOrder.status === "pending" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("pending")}
                          disabled={updateOrderStatusMutation.isPending}
                          className={selectedOrder.status === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
                        >
                          <Clock className="mr-1 h-4 w-4" />
                          En attente
                        </Button>
                        <Button
                          variant={selectedOrder.status === "shipped" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("shipped")}
                          disabled={updateOrderStatusMutation.isPending}
                          className={selectedOrder.status === "shipped" ? "bg-blue-500 hover:bg-blue-600" : ""}
                        >
                          <Truck className="mr-1 h-4 w-4" />
                          Expédiée
                        </Button>
                        <Button
                          variant={selectedOrder.status === "delivered" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("delivered")}
                          disabled={updateOrderStatusMutation.isPending}
                          className={selectedOrder.status === "delivered" ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Livrée
                        </Button>
                        <Button
                          variant={selectedOrder.status === "cancelled" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("cancelled")}
                          disabled={updateOrderStatusMutation.isPending}
                          className={selectedOrder.status === "cancelled" ? "bg-red-500 hover:bg-red-600" : ""}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Annulée
                        </Button>
                        
                        {updateOrderStatusMutation.isPending && (
                          <div className="ml-2 flex items-center text-sm text-gray-500">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Mise à jour...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Customer Info */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Informations client</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Client ID</p>
                          <p className="font-medium">#{selectedOrder.userId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Adresse de livraison</p>
                          <p className="font-medium">{selectedOrder.shippingAddress}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Order Items */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Articles commandés</h3>
                      
                      {isOrderDetailLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : !orderDetails || !orderDetails.items ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Aucun détail disponible pour cette commande.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead>Prix unitaire</TableHead>
                                <TableHead>Quantité</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orderDetails.items.map((item: any) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      {item.product && (
                                        <div className="w-10 h-10 rounded overflow-hidden">
                                          <img 
                                            src={item.product.imageUrl} 
                                            alt={item.product.name} 
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-medium">
                                          {item.product ? item.product.name : `Produit #${item.productId}`}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          ID: {item.productId}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{formatPrice(item.priceAtPurchase)}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatPrice(item.priceAtPurchase * item.quantity)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    {/* Order Summary */}
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-medium">Total de la commande</div>
                      <div className="text-xl font-bold">{formatPrice(selectedOrder.totalAmount)}</div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

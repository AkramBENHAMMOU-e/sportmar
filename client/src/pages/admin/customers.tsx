import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  AlertCircle 
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
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/admin/sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { User, Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Pagination settings
const ITEMS_PER_PAGE = 10;

type UserWithoutPassword = Omit<User, "password">;

export default function AdminCustomers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch all customers
  const { 
    data: customers = [], 
    isLoading, 
    error 
  } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/customers"],
  });

  // Fetch customer orders when a user is selected
  const { 
    data: userOrders = [],
    isLoading: isUserOrdersLoading
  } = useQuery<Order[]>({
    queryKey: [`/api/admin/customers/${selectedUser?.id}/orders`],
    enabled: !!selectedUser,
    // Mock implementation since this endpoint doesn't exist in the API
    queryFn: async () => {
      if (!selectedUser) return [];
      const allOrders = await queryClient.fetchQuery({ queryKey: ["/api/admin/orders"] });
      return allOrders.filter((order: Order) => order.userId === selectedUser.id);
    }
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/customers/${id}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      setIsUserDetailOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression du client: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle viewing customer details
  const handleViewCustomer = (customer: UserWithoutPassword) => {
    setSelectedUser(customer);
    setIsUserDetailOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteClick = (customer: UserWithoutPassword) => {
    setSelectedUser(customer);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming delete
  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteCustomerMutation.mutate(selectedUser.id);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const searchTarget = `${customer.fullName} ${customer.email} ${customer.username}`.toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers
    .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestion des clients</h1>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email ou nom d'utilisateur..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Customers List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Une erreur est survenue lors du chargement des clients. Veuillez réessayer.
              </AlertDescription>
            </Alert>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? "Aucun client ne correspond à vos critères de recherche." 
                  : "Aucun client n'est inscrit pour le moment."}
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>
                  {filteredCustomers.length} client{filteredCustomers.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {customer.fullName?.charAt(0) || customer.username.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{customer.fullName || "N/A"}</div>
                                <div className="text-sm text-gray-500">@{customer.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {customer.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(customer.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewCustomer(customer)}
                              >
                                Détails
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteClick(customer)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                      Affichage de {((page - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(page * ITEMS_PER_PAGE, filteredCustomers.length)} sur {filteredCustomers.length} clients
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

          {/* Customer Detail Dialog */}
          <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              {selectedUser && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Détails du client
                    </DialogTitle>
                    <DialogDescription>
                      Informations et historique de commandes
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <Tabs defaultValue="info">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Informations</TabsTrigger>
                        <TabsTrigger value="orders">Commandes</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="info" className="space-y-4 pt-4">
                        {/* User Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium text-gray-700 mb-3">Informations personnelles</h3>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Nom complet</p>
                                <p className="font-medium">{selectedUser.fullName || "Non renseigné"}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                                <p className="font-medium">@{selectedUser.username}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                  <p className="font-medium">{selectedUser.email}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Date d'inscription</p>
                                <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-700 mb-3">Coordonnées</h3>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-500">Téléphone</p>
                                {selectedUser.phoneNumber ? (
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                    <p className="font-medium">{selectedUser.phoneNumber}</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-400 italic">Non renseigné</p>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Adresse</p>
                                {selectedUser.address ? (
                                  <div className="flex items-start">
                                    <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-1" />
                                    <p className="font-medium">{selectedUser.address}</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-400 italic">Non renseignée</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-end">
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setIsUserDetailOpen(false);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer ce client
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="orders" className="space-y-4 pt-4">
                        {/* User Orders */}
                        <h3 className="font-medium text-gray-700 mb-3">Historique des commandes</h3>
                        
                        {isUserOrdersLoading ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : userOrders.length === 0 ? (
                          <div className="bg-gray-50 p-8 text-center rounded-lg">
                            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                            <p className="text-gray-500">
                              Ce client n'a pas encore passé de commande.
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>N° de commande</TableHead>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Statut</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {userOrders.map((order) => (
                                  <TableRow key={order.id}>
                                    <TableCell>#{order.id}</TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell>
                                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        order.status === "pending" ? "bg-amber-100 text-amber-800" :
                                        order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                                        "bg-red-100 text-red-800"
                                      }`}>
                                        {order.status === "pending" ? "En attente" :
                                         order.status === "shipped" ? "Expédiée" :
                                         order.status === "delivered" ? "Livrée" :
                                         "Annulée"}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {new Intl.NumberFormat('fr-MA', {
                                        style: 'currency',
                                        currency: 'MAD',
                                        minimumFractionDigits: 0,
                                      }).format(order.totalAmount / 100)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer le client {selectedUser?.fullName || selectedUser?.username} ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  disabled={deleteCustomerMutation.isPending}
                >
                  {deleteCustomerMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

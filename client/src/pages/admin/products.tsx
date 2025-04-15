import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Save, 
  X, 
  Loader2, 
  AlertCircle,
  Check
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
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/admin/sidebar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Product, InsertProduct, insertProductSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminProducts() {
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch all products
  const { 
    data: products = [], 
    isLoading, 
    error 
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Product form for add
  const addProductForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "supplement",
      subcategory: "proteine",
      stock: 0,
      featured: false,
      discount: 0,
    },
  });
  const { formState: { isSubmitting } } = addProductForm;

  // Product form for edit
  const editProductForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "supplement",
      subcategory: "proteine",
      stock: 0,
      featured: false,
      discount: 0,
    },
  });
  const { formState: { isSubmitting: isEditSubmitting } } = editProductForm;

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      // Convert price to centimes
      const formattedData = {
        ...data,
        price: Number(data.price) * 100,
        stock: Number(data.stock),
        discount: Number(data.discount)
      };

      const res = await apiRequest("POST", "/api/products", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      setIsAddProductOpen(false);
      addProductForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout du produit: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: InsertProduct & { id: number }) => {
      const { id, ...productData } = data;
      
      // Convert price to centimes
      const formattedData = {
        ...productData,
        price: Number(productData.price) * 100,
        stock: Number(productData.stock),
        discount: Number(productData.discount)
      };

      const res = await apiRequest("PATCH", `/api/products/${id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      setIsEditProductOpen(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produit mis à jour",
        description: "Le produit a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du produit: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression du produit: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle opening add product dialog
  const handleAddProduct = () => {
    addProductForm.reset({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "supplement",
      subcategory: "proteine",
      stock: 0,
      featured: false,
      discount: 0,
    });
    setIsAddProductOpen(true);
  };

  // Handle opening edit product dialog
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    
    // Reset form with product data
    editProductForm.reset({
      name: product.name,
      description: product.description,
      // Convert price from centimes to MAD
      price: product.price / 100,
      imageUrl: product.imageUrl,
      category: product.category,
      subcategory: product.subcategory,
      stock: product.stock,
      featured: product.featured,
      discount: product.discount,
    });
    
    setIsEditProductOpen(true);
  };

  // Handle opening delete product dialog
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming delete product
  const handleConfirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  // Handle form submission for adding product
  const onAddSubmit = (data: InsertProduct) => {
    createProductMutation.mutate(data);
  };

  // Handle form submission for editing product
  const onEditSubmit = (data: InsertProduct) => {
    if (selectedProduct) {
      updateProductMutation.mutate({ ...data, id: selectedProduct.id });
    }
  };

  // Filter products based on search and category
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(product => 
      categoryFilter === "all" || product.category === categoryFilter
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Gestion des produits</h1>
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un produit..."
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="supplement">Compléments alimentaires</SelectItem>
                  <SelectItem value="equipment">Équipements sportifs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                Une erreur est survenue lors du chargement des produits. Veuillez réessayer.
              </AlertDescription>
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || categoryFilter !== "all" 
                  ? "Aucun produit ne correspond à vos critères de recherche." 
                  : "Commencez par ajouter votre premier produit."}
              </p>
              <Button onClick={handleAddProduct}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un produit
              </Button>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-0">
                <CardTitle>
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 overflow-hidden rounded border border-gray-200">
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="flex items-center mt-1 space-x-1">
                                  {product.featured && (
                                    <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
                                      Populaire
                                    </Badge>
                                  )}
                                  {product.discount && product.discount > 0 && (
                                    <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                                      -{product.discount}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {product.category === "supplement" ? "Complément" : "Équipement"}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {product.subcategory}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatPrice(product.price)}</div>
                            {product.discount && product.discount > 0 && (
                              <div className="text-xs text-gray-500 line-through">
                                {formatPrice(Math.round(product.price / (1 - product.discount / 100)))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className={`font-medium ${product.stock < 5 ? 'text-amber-600' : ''} ${product.stock === 0 ? 'text-red-500' : ''}`}>
                              {product.stock}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteClick(product)}
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
              </CardContent>
            </Card>
          )}

          {/* Add Product Dialog */}
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                <DialogDescription>
                  Remplissez le formulaire ci-dessous pour ajouter un nouveau produit au catalogue.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addProductForm}>
                <form onSubmit={addProductForm.handleSubmit(onAddSubmit)} className="space-y-4">
                  <Tabs defaultValue="basic">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Informations de base</TabsTrigger>
                      <TabsTrigger value="details">Détails</TabsTrigger>
                      <TabsTrigger value="inventory">Inventaire & Prix</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4 pt-4">
                      <FormField
                        control={addProductForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du produit</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Protéine Whey Premium" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addProductForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Description détaillée du produit" 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addProductForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image du produit</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value || ""}
                                onChange={field.onChange}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormDescription>
                              Téléchargez une image pour votre produit.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addProductForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catégorie</FormLabel>
                              <Select 
                                key="category-select"
                                value={field.value} 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  
                                  // Si la catégorie change, on réinitialise la sous-catégorie avec une valeur compatible
                                  if (value === "supplement") {
                                    addProductForm.setValue("subcategory", "proteine");
                                  } else if (value === "equipment") {
                                    addProductForm.setValue("subcategory", "musculation");
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une catégorie" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="supplement">Complément alimentaire</SelectItem>
                                  <SelectItem value="equipment">Équipement sportif</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addProductForm.control}
                          name="subcategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sous-catégorie</FormLabel>
                              <Select 
                                key={`subcategory-select-${addProductForm.watch("category") || "default"}`}
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une sous-catégorie" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {addProductForm.watch("category") === "supplement" ? (
                                    <>
                                      <SelectItem value="proteine">Protéine</SelectItem>
                                      <SelectItem value="vitamine">Vitamine</SelectItem>
                                      <SelectItem value="bruleur">Brûleur de graisse</SelectItem>
                                      <SelectItem value="acides-amines">Acides aminés</SelectItem>
                                      <SelectItem value="performance">Performance</SelectItem>
                                    </>
                                  ) : (
                                    <>
                                      <SelectItem value="musculation">Musculation</SelectItem>
                                      <SelectItem value="cardio">Cardio</SelectItem>
                                      <SelectItem value="accessoires">Accessoires</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={addProductForm.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange as (checked: CheckedState) => void}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Produit en vedette</FormLabel>
                              <FormDescription>
                                Ce produit sera affiché sur la page d'accueil
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="inventory" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={addProductForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prix (MAD)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01"
                                  value={String(field.value ?? 0)}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={addProductForm.control}
                          name="discount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remise (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100"
                                  value={String(field.value ?? 0)}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={addProductForm.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock disponible</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                value={String(field.value ?? 0)}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createProductMutation.isPending}>
                      {createProductMutation.isPending ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Ajout en cours...
                        </>
                      ) : (
                        "Ajouter le produit"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Product Dialog */}
          <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier le produit</DialogTitle>
                <DialogDescription>
                  Modifiez les informations du produit ci-dessous.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editProductForm}>
                <form onSubmit={editProductForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <Tabs defaultValue="basic">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Informations de base</TabsTrigger>
                      <TabsTrigger value="details">Détails</TabsTrigger>
                      <TabsTrigger value="inventory">Inventaire & Prix</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4 pt-4">
                      <FormField
                        control={editProductForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du produit</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editProductForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editProductForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image du produit</FormLabel>
                            <FormControl>
                              <ImageUpload
                                value={field.value || ""}
                                onChange={field.onChange}
                                disabled={isEditSubmitting}
                              />
                            </FormControl>
                            <FormDescription>
                              Téléchargez une image pour votre produit.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={editProductForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catégorie</FormLabel>
                              <Select 
                                key="edit-category-select"
                                value={field.value} 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  
                                  // Si la catégorie change, on réinitialise la sous-catégorie avec une valeur compatible
                                  if (value === "supplement") {
                                    editProductForm.setValue("subcategory", "proteine");
                                  } else if (value === "equipment") {
                                    editProductForm.setValue("subcategory", "musculation");
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une catégorie" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="supplement">Complément alimentaire</SelectItem>
                                  <SelectItem value="equipment">Équipement sportif</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editProductForm.control}
                          name="subcategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sous-catégorie</FormLabel>
                              <Select 
                                key={`edit-subcategory-select-${editProductForm.watch("category") || "default"}`}
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez une sous-catégorie" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {editProductForm.watch("category") === "supplement" ? (
                                    <>
                                      <SelectItem value="proteine">Protéine</SelectItem>
                                      <SelectItem value="vitamine">Vitamine</SelectItem>
                                      <SelectItem value="bruleur">Brûleur de graisse</SelectItem>
                                      <SelectItem value="acides-amines">Acides aminés</SelectItem>
                                      <SelectItem value="performance">Performance</SelectItem>
                                    </>
                                  ) : (
                                    <>
                                      <SelectItem value="musculation">Musculation</SelectItem>
                                      <SelectItem value="cardio">Cardio</SelectItem>
                                      <SelectItem value="accessoires">Accessoires</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={editProductForm.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value as boolean}
                                onCheckedChange={field.onChange as (checked: CheckedState) => void}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Produit populaire</FormLabel>
                              <p className="text-sm text-gray-500">
                                Ce produit sera mis en avant sur la page d'accueil
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="inventory" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={editProductForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prix (MAD)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01"
                                  value={String(field.value ?? 0)}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editProductForm.control}
                          name="discount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remise (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100"
                                  value={String(field.value ?? 0)}
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={editProductForm.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock disponible</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                value={String(field.value ?? 0)}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditProductOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateProductMutation.isPending}
                    >
                      {updateProductMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Enregistrer les modifications
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Êtes-vous sûr de vouloir supprimer le produit "{selectedProduct?.name}" ? Cette action est irréversible.
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
                  disabled={deleteProductMutation.isPending}
                >
                  {deleteProductMutation.isPending ? (
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

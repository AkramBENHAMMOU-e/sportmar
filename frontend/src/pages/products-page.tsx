import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { 
  ArrowUpDown, 
  Filter, 
  Check, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import ProductGrid from "@/components/product/product-grid";
import { Product } from "@shared/schema";

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
  ]
};

const sortOptions = [
  { label: "Prix: croissant", value: "price-asc" },
  { label: "Prix: décroissant", value: "price-desc" },
  { label: "Nouveautés", value: "newest" },
  { label: "Popularité", value: "popularity" },
];

export default function ProductsPage() {
  const { category, subcategory } = useParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [inStock, setInStock] = useState<boolean>(false);
  const [discounted, setDiscounted] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("popularity");
  
  // Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('query');
  const hasDiscountFilter = urlParams.get('discount') === 'true';
  
  // Si un filtre de remise est spécifié dans l'URL, l'appliquer
  useEffect(() => {
    if (hasDiscountFilter) {
      setDiscounted(true);
    }
  }, [hasDiscountFilter]);

  // Determine API endpoint based on params
  let queryKey: string;
  if (searchQuery) {
    queryKey = `/api/products?query=${searchQuery}`;
  } else if (subcategory) {
    queryKey = `/api/products/subcategory/${subcategory}`;
  } else if (category) {
    queryKey = `/api/products/category/${category}`;
  } else {
    queryKey = `/api/products`;
  }

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: [queryKey],
  });

  // Apply filters
  const filteredProducts = products
    .filter(product => {
      // Appliquer le filtre de recherche si un terme de recherche est spécifié
      const matchesSearch = searchQuery 
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      
      const matchesPrice = product.price >= priceRange[0] * 100 && 
                         product.price <= priceRange[1] * 100;
      
      const matchesStock = inStock ? product.stock > 0 : true;
      const matchesDiscount = discounted ? (product.discount || 0) > 0 : true;
      
      return matchesSearch && matchesPrice && matchesStock && matchesDiscount;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popularity":
        default:
          return b.featured ? 1 : -1;
      }
    });

  // Set page title based on category
  let pageTitle = "Tous les produits";
  if (searchQuery) {
    pageTitle = `Résultats pour "${searchQuery}"`;
  } else if (category === "supplement") {
    pageTitle = "Compléments alimentaires";
  } else if (category === "equipment") {
    pageTitle = "Équipements sportifs";
  } else if (subcategory) {
    const allSubcategories = [...subcategories.supplement, ...subcategories.equipment];
    const foundSubcategory = allSubcategories.find(s => s.value === subcategory);
    pageTitle = foundSubcategory ? foundSubcategory.label : "Produits";
  } else if (hasDiscountFilter) {
    pageTitle = "Produits en promotion";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
        <p className="text-gray-600 mt-2">
          Découvrez notre sélection de produits de qualité supérieure pour atteindre vos objectifs fitness.
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche avec les filtres ci-dessous
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Category filter */}
                {!subcategory && !category && (
                  <div>
                    <h3 className="text-base font-medium mb-3">Catégories</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="supplement" 
                          onCheckedChange={() => window.location.href = "/products/category/supplement"}
                        />
                        <Label htmlFor="supplement">Compléments alimentaires</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="equipment" 
                          onCheckedChange={() => window.location.href = "/products/category/equipment"}
                        />
                        <Label htmlFor="equipment">Équipements sportifs</Label>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Subcategory filter */}
                {category && (
                  <div>
                    <h3 className="text-base font-medium mb-3">Sous-catégories</h3>
                    <div className="space-y-2">
                      {subcategories[category as keyof typeof subcategories].map((subcat) => (
                        <div key={subcat.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={subcat.value} 
                            onCheckedChange={() => window.location.href = `/products/subcategory/${subcat.value}`}
                          />
                          <Label htmlFor={subcat.value}>{subcat.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} />
    </div>
  );
}
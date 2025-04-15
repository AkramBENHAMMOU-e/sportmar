import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Home, ShoppingBag, Heart, User, Menu, Search } from "lucide-react";
import { SafeLink } from "@/components/ui/safe-link";
import Logo from "@/components/layout/logo";
import { Input } from "@/components/ui/input";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const [supplementsOpen, setSupplementsOpen] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = window.location.pathname;
  
  // Fermer les sous-menus lorsque le menu principal se ferme
  useEffect(() => {
    if (!isOpen) {
      setSupplementsOpen(false);
      setEquipmentOpen(false);
    }
  }, [isOpen]);
  
  // Empêcher le défilement du body lorsque le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?query=${encodeURIComponent(searchQuery.trim())}`;
      setIsOpen(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden overflow-auto">
      <div className="bg-background h-full w-[85%] max-w-sm shadow-lg transform transition-transform animate-in slide-in-from-left duration-300 flex flex-col">
        {/* Header du menu */}
        <div className="border-b border-border p-4 flex justify-between items-center">
          <Logo />
          <button 
            className="text-foreground rounded-full p-1.5 hover:bg-secondary/10"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Recherche */}
        <div className="p-4 border-b border-border">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <Input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 bg-muted/50 rounded-lg border-0 focus:ring-1 focus:ring-secondary w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 text-muted-foreground h-4 w-4" />
          </form>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-2">
            <SafeLink 
              href="/" 
              className={`mobile-nav-item ${pathname === '/' ? 'mobile-nav-active' : ''}`}
              onBeforeNavigate={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              Accueil
            </SafeLink>
            
            <div className="mt-2">
              <button 
                className={`mobile-nav-item w-full flex justify-between items-center ${pathname.includes('/products/category/supplement') ? 'mobile-nav-active' : ''}`}
                onClick={() => setSupplementsOpen(!supplementsOpen)}
              >
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  Compléments
                </div>
                {supplementsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {supplementsOpen && (
                <div className="ml-8 mt-1 space-y-1 border-l-2 border-secondary/20 pl-4">
                  <SafeLink 
                    href="/products/subcategory/proteine" 
                    className={`mobile-nav-item py-2 ${pathname.includes('/products/subcategory/proteine') ? 'text-secondary' : ''}`}
                    onBeforeNavigate={() => setIsOpen(false)}
                  >
                    Protéines
                  </SafeLink>
                  <SafeLink 
                    href="/products/subcategory/vitamine" 
                    className={`mobile-nav-item py-2 ${pathname.includes('/products/subcategory/vitamine') ? 'text-secondary' : ''}`}
                    onBeforeNavigate={() => setIsOpen(false)}
                  >
                    Vitamines
                  </SafeLink>
                  <SafeLink 
                    href="/products/subcategory/bruleur" 
                    className={`mobile-nav-item py-2 ${pathname.includes('/products/subcategory/bruleur') ? 'text-secondary' : ''}`}
                    onBeforeNavigate={() => setIsOpen(false)}
                  >
                    Brûleurs de graisse
                  </SafeLink>
                  <SafeLink 
                    href="/products/category/supplement" 
                    className={`mobile-nav-item py-2 ${pathname === '/products/category/supplement' ? 'text-secondary' : ''}`}
                    onBeforeNavigate={() => setIsOpen(false)}
                  >
                    Voir tout
                  </SafeLink>
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <button 
                className={`mobile-nav-item w-full flex justify-between items-center ${pathname.includes('/products/category/equipment') ? 'mobile-nav-active' : ''}`}
                onClick={() => setEquipmentOpen(!equipmentOpen)}
              >
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-3" />
                  Équipements
                </div>
                {equipmentOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {equipmentOpen && (
                <div className="ml-8 mt-1 space-y-1 border-l-2 border-secondary/20 pl-4">
                  <SafeLink 
                    href="/products/subcategory/musculation" 
                    className={`mobile-nav-item py-2 ${pathname.includes('/products/subcategory/musculation') ? 'text-secondary' : ''}`}
                    onBeforeNavigate={() => setIsOpen(false)}
                  >
                    Haltères
                  </SafeLink>
                  <SafeLink 
                    href="/products/subcategory/cardio" 
                    className={`mobile-nav-item py-2 ${pathname.includes('/products/subcategory/cardio') ? 'text-secondary' : ''}`}
                    onBeforeNavigate={() => setIsOpen(false)}
                  >
                    Tapis de course
                  </SafeLink>
                  <SafeLink 
                    href="/products/subcategory/accessoires" 
                    className={`mobile-nav-item py-2 ${pathname.includes('/products/subcategory/accessoires') ? 'text-secondary' : ''}`}
                    onBeforeNavigate={() => setIsOpen(false)}
                  >
                    Bandes élastiques
                  </SafeLink>
                  <SafeLink 
                    href="/products/category/equipment" 
                    className={`mobile-nav-item py-2 ${pathname === '/products/category/equipment' ? 'text-secondary' : ''}`}
                    onBeforeNavigate={() => setIsOpen(false)}
                  >
                    Voir tout
                  </SafeLink>
                </div>
              )}
            </div>
            
            <SafeLink 
              href="/products" 
              className={`mobile-nav-item mt-2 ${pathname === '/products' ? 'mobile-nav-active' : ''}`}
              onBeforeNavigate={() => setIsOpen(false)}
            >
              <Heart className="h-5 w-5 mr-3" />
              Promotions
            </SafeLink>
            
            <SafeLink 
              href="/cart" 
              className={`mobile-nav-item mt-2 ${pathname === '/cart' ? 'mobile-nav-active' : ''}`}
              onBeforeNavigate={() => setIsOpen(false)}
            >
              <ShoppingBag className="h-5 w-5 mr-3" />
              Panier
            </SafeLink>
          </div>
        </nav>
        
        {/* Footer du menu */}
        <div className="border-t border-border p-4 mt-auto">
          <SafeLink 
            href="/auth" 
            className="mobile-nav-item bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg justify-center"
            onBeforeNavigate={() => setIsOpen(false)}
          >
            <User className="h-5 w-5 mr-2" />
            Mon Compte
          </SafeLink>
        </div>
      </div>
      
      {/* Overlay pour fermer le menu en cliquant en dehors */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={() => setIsOpen(false)}
        tabIndex={-1}
        data-overlay="true"
      />
    </div>
  );
}
